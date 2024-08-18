import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";

import prisma from "../DB/db.config.js";

import {
  generateRandomNum,
  imageValidator,
  removeImage,
  uploadImage,
} from "../utils/helper.js";
import newsApiTransform from "../transform/newsAPITransform.js";
import redisCache from "../DB/redis.config.js";

class NewsController {
  static async index(req, res) {
    // Query parameters se `page` ki value nikal rahe hain, agar nahi mili toh default 1 set kar rahe hain.
    const page = Number(req.query.page) || 1;
    // Query parameters se `limit` ki value nikal rahe hain, agar nahi mili toh default 10 set kar rahe hain.
    const limit = Number(req.query.page) || 10;

    // Agar page ki value 0 ya usse kam hai, toh `page` ko 1 set kar dete hain.
    if (page <= 0) {
      page = 1;
    }

    // Agar limit 0 ya usse kam hai ya 100 se zyada hai, toh `limit` ko 10 set kar dete hain.
    if (limit <= 0 || limit > 100) {
      limit = 10;
    }

    // Pagination ke liye skip calculate kar rahe hain. `skip` ka matlab hai kitne records ko skip karna hai.
    const skip = (page - 1) * limit;

    // Database se news fetch kar rahe hain. `limit` ke hisaab se news fetch hogi aur `skip` ke hisaab se records skip karenge.
    const news = await prisma.news.findMany({
      take: limit, // Kitne records fetch karne hain
      skip: skip, // Kitne records skip karne hain
      include: {
        // Related user information bhi fetch kar rahe hain.
        user: {
          select: {
            id: true, // User ki ID
            name: true, // User ka naam
            profile: true, // User ka profile
          },
        },
      },
    });

    // Har news item ko transform kar rahe hain using `newsApiTransform.transform`
    const newsTransform = news?.map((item) => newsApiTransform.transform(item));

    // Total news ka count fetch kar rahe hain.
    const totalNews = await prisma.news.count();

    // Total pages calculate kar rahe hain based on total news and limit.
    const totalPages = Math.ceil(totalNews / limit);

    // Response return kar rahe hain jisme transformed news, total pages, current page aur current limit included hain.
    return res.json({
      status: 200, // Success status
      news: newsTransform, // Transformed news data
      metadata: {
        totalPages, // Total pages ka count
        currentPage: page, // Current page number
        currentLimit: limit, // Current limit (kitne records fetch kar rahe hain)
      },
    });
  }

  static async store(req, res) {
    try {
      // req.user se logged-in user ki information nikal rahe hain
      const user = req.user;

      // req.body se request ka data (form data) nikal rahe hain
      const body = req.body;

      // newsSchema ko compile kar ke validator bana rahe hain
      const validator = vine.compile(newsSchema);

      // body data ko validate kar rahe hain validator ke through
      const payload = await validator.validate(body);

      // Agar request mein koi file nahi hai ya files ka object empty hai, toh error message ke saath response return karo
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          errors: {
            image: "Image field is required", // Error message agar image field nahi milti
          },
        });
      }

      // Image file ko request se extract kar rahe hain
      const image = req.files?.image;

      // Image ko custom validator se check kar rahe hain (size aur type validate karna)
      const message = imageValidator(image?.size, image?.mimetype);

      // Agar validation fail hota hai toh error message ke saath response return karo
      if (message !== null) {
        return res.status(400).json({
          errors: {
            image: message, // Invalid image ka error message
          },
        });
      }

      // Agar image valid hai, toh usko upload karne ke liye image ka naam generate karte hain
      const imageName = uploadImage(image);

      // Payload mein image ka naam aur user ID add kar rahe hain ki kiss user ne ye news create kari hai
      payload.image = imageName;
      payload.user_id = user.id;

      // Database mein news entry create kar rahe hain validated payload ke saath
      const news = await prisma.news.create({
        data: payload,
      });

      //* remove cache

      redisCache.del("/api/news", (err) => {
        if (err) throw err;
      });

      // Success message ke saath response return karte hain agar sab kuch sahi raha
      return res.json({
        status: 200, // Success status code
        message: "News Created Successfully!", // Success message
        news, // Created news object
      });
    } catch (error) {
      // Agar koi error aata hai toh error message ke saath response return karte hain
      console.log("The error is: ", error);

      // Agar validation error aata hai toh usko handle karte hain
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          errors: error.messages, // Validation errors
        });
      } else {
        return res.status(500).json({
          status: 500, // Internal server error code
          message: "Something went wrong... Please try again", // Error message
        });
      }
    }
  }

  static async show(req, res) {
    try {
      // URL se `id` ko nikal rahe hain jo humne params ke through pass kiya hai
      const { id } = req.params;

      // Database se unique news item ko fetch karne ke liye `prisma.news.findUnique` method ka use kar rahe hain
      const news = await prisma.news.findUnique({
        where: {
          // Jo id params se mili hai usko number me convert karke `id` se match kar rahe hain
          id: Number(id),
        },
        include: {
          // Related user information ko include kar rahe hain
          user: {
            select: {
              id: true, // User ki ID
              name: true, // User ka naam
              profile: true, // User ka profile image
            },
          },
        },
      });

      // Agar news mil gayi toh usko transform kar rahe hain using `newsApiTransform.transform`, agar nahi mili toh `null` set kar rahe hain
      const transformNews = news ? newsApiTransform.transform(news) : null;

      // Response return kar rahe hain jisme transformed news data aur status included hain
      return res.json({
        status: 200, // Success status
        news: transformNews, // Transformed news data ya null
      });
    } catch (error) {
      // Agar koi error aata hai toh error message ke saath response return karte hain
      return res.status(500).json({
        message: "Something Went Wrong... Please try again", // Error message
      });
    }
  }

  static async update(req, res) {
    try {
      // URL se `id` ko nikal rahe hain jo news item ko uniquely identify kar rahi hai
      const { id } = req.params;

      // `req.user` se logged-in user ki information ko fetch kar rahe hain
      const user = req.user;

      // Request body se updated data ko fetch kar rahe hain
      const body = req.body;

      // Database se unique news item ko fetch kar rahe hain using `prisma.news.findUnique`
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id), // Jo id params se mili usko number me convert karke match kar rahe hain
        },
      });

      // Agar logged-in user ka id, news creator ke user_id se match nahi karti toh "Unauthorized" response return karenge
      if (user.id !== news.user_id) {
        return res.status(400).json({
          message: "Unauthorized", // Unauthorized message
        });
      }

      // Body data ko validate karne ke liye `vine.compile` aur `newsSchema` ka use kar rahe hain
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      // Agar image upload ki gayi hai toh `image` variable mein usko store kar rahe hain
      const image = req?.files?.image;

      if (image) {
        // Image size aur type ko validate karne ke liye `imageValidator` function ka use kar rahe hain
        const message = imageValidator(image?.size, image?.mimetype);

        // Agar image invalid hai toh error message ke saath response return karenge
        if (message !== null) {
          return res.status(400).json({
            errors: {
              image: message, // Image validation error
            },
          });
        }

        //* Nayi image ko upload karne ke liye `uploadImage` function ka use kar rahe hain
        const imageName = uploadImage(image);
        payload.image = imageName;

        //* Purani image ko delete karne ke liye `removeImage` function ka use karte hain
        removeImage(news.image);
      }

      // Database mein news item ko update karne ke liye `prisma.news.update` ka use kar rahe hain
      await prisma.news.update({
        data: payload, // Updated data
        where: {
          id: Number(id), // ID se news item ko identify karte hain
        },
      });

      // Update successful hone par success message ke saath response return karte hain
      return res.status(200).json({
        message: "News Updated Successfully", // Success message
      });
    } catch (error) {
      console.log("The error is: ", error);

      // Validation error aane par error messages ke saath response return karenge
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          errors: error.messages, // Validation errors
        });
      } else {
        // Koi aur error aane par 500 status ke saath error message return karenge
        return res.status(500).json({
          status: 500,
          message: "Something went wrong... Please try again", // General error message
        });
      }
    }
  }

  static async destroy(req, res) {
    try {
      // URL se `id` ko nikal rahe hain jo news item ko uniquely identify kar rahi hai
      const { id } = req.params;

      // `req.user` se logged-in user ki information ko fetch kar rahe hain
      const user = req.user;

      // Database se unique news item ko fetch kar rahe hain using `prisma.news.findUnique`
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id), // Jo id params se mili usko number me convert karke match kar rahe hain
        },
      });

      // Agar logged-in user ka id, news creator ke user_id se match nahi karti toh "Unauthorized" response return karenge
      if (user.id !== news.user_id) {
        return res.status(401).json({
          message: "Unauthorized", // Unauthorized message
        });
      }

      //* Filesystem se image ko delete karne ke liye `removeImage` function ka use kar rahe hain
      removeImage(news.image);

      // Database se news item ko delete karne ke liye `prisma.news.delete` ka use kar rahe hain
      await prisma.news.delete({
        where: {
          id: Number(id), // ID se news item ko identify karte hain
        },
      });

      // Delete successful hone par success message ke saath response return karte hain
      return res.status(200).json({
        message: "News Deleted Successfully", // Success message
      });
    } catch (error) {
      // Koi error aane par 500 status ke saath error message return karenge
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again", // General error message
      });
    }
  }
}

export default NewsController;
