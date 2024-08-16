import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";

import prisma from "../DB/db.config.js";

import { generateRandomNum, imageValidator } from "../utils/helper.js";
import newsApiTransform from "../transform/newsAPITransform.js";

class NewsController {
  static async index(req, res) {
    const news = await prisma.news.findMany({});

    const newsTransform = news?.map((item)=> newsApiTransform.transform(item))

    return res.json({
      status: 200,
      news: newsTransform,
    });
  }

  static async store(req, res) {
    try {
      const user = req.user;

      const body = req.body;

      const validator = vine.compile(newsSchema);

      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          errors: {
            image: "Image field is required",
          },
        });
      }

      const image = req.files?.image;

      //* Image custom validator
      const message = imageValidator(image?.size, image?.mimetype);

      if (message !== null) {
        return res.status(400).json({
          errors: {
            image: message,
          },
        });
      }

      //* Image Upload
      // imgExt => returning an array by spliting the name of profile image i.e firstOne => Name of file secondOne => extension of profile image
      const imgExt = image?.name.split(".");

      // This will contains the randomnumber with profile image extension as:- 545542.img, 5453154.wbpeg, 54240.jpeg etc.
      const imageName = generateRandomNum() + "." + imgExt[1];

      // Now this will upload our image in the given directory
      const uploadPath = process.cwd() + "/public/images/" + imageName;

      image.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      payload.image = imageName;
      payload.user_id = user.id;

      const news = await prisma.news.create({
        data: payload,
      });

      return res.json({
        status: 200,
        message: "News Created Successfully!",
        news,
      });
    } catch (error) {
      console.log("The error is: ", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);

        return res.status(400).json({
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong... Please try again",
        });
      }
    }
  }

  static async show(req, res) {}

  static async update(req, res) {}

  static async destroy(req, res) {}
}

export default NewsController;
