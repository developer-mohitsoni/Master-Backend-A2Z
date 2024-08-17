import prisma from "../DB/db.config.js";

import { generateRandomNum, imageValidator } from "../utils/helper.js";

class ProfileController {
  // Database se user ki information ko get karne ke liye ek static async function "index" banaya gaya hai
  static async index(req, res) {
    try {
      // Jab humne JWT token create kiya tha, us time jo data (payload) usme pass kiya tha, woh data ab req.user mein available hai
      const user = req.user;

      // Agar user ka data mil jata hai, toh successful response ke saath user ka data return karte hain
      return res.json({
        status: 200, // Status code 200 indicate karta hai ki request successful rahi
        message: "Profile fetched successfully", // Success message
        user, // User ka data response mein bheja jata hai
      });
    } catch (error) {
      // Agar koi error aata hai, toh yeh code chalega aur error message ke saath response return karega
      return res.status(500).json({
        message: "Something Went Wrong...", // Error message agar kuch galat ho gaya
      });
    }
  }

  // To store something in DB
  static async store() {}

  // To fetch single record from DB
  static async show() {}

  // To update something from DB
  static async update(req, res) {
    try {
      // Ye id ko extract kar raha hai jo URL ke params mein se mil rahi hai
      const { id } = req.params;

      // Agar request mein files nahi hain ya files ka object empty hai, toh error message ke saath response return karo
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          status: 400, // Status code 400: Bad Request
          message: "Profile image is required", // Error message agar profile image nahi milti
        });
      }

      // Profile image ko req.files se extract karte hain
      const profile = req.files.profile;

      // ImageValidator function ko call karte hain jo image ke size aur mimetype ko check karega
      const message = imageValidator(profile.size, profile.mimetype);

      // Agar message null nahi hai, yani image valid nahi hai, toh error message ke saath response return karo
      if (message !== null) {
        return res.status(400).json({
          errors: {
            profile: message, // Invalid image ka error message
          },
        });
      }

      // Profile image ke naam ko split karke uska extension nikal rahe hain
      const imgExt = profile?.name.split(".");

      // Random number generate karke uska extension add karke image ka naya naam bana rahe hain
      const imageName = generateRandomNum() + "." + imgExt[1];

      // Upload path set kar rahe hain jahan image ko save karna hai
      const uploadPath = process.cwd() + "/public/images/" + imageName;

      // Image ko specified directory mein move karte hain, agar error aaya toh throw karenge
      profile.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      // User ke profile ko database mein update karte hain nayi image ke naam ke saath
      await prisma.users.update({
        data: {
          profile: imageName, // Profile image ka naya naam database mein update karte hain
        },
        where: {
          id: Number(id), // User ki ID ke basis par update karte hain
        },
      });

      // Success message ke saath response return karte hain agar sab kuch sahi raha
      return res.json({
        status: 200, // Success status code
        message: "Profile Updated Successfully!", // Success message
      });
    } catch (err) {
      // Agar koi error aata hai toh error message ke saath response return karte hain
      console.log("The error is", err);

      return res.status(500).json({
        message: "Something went wrong. Please try again!", // Error message
      });
    }
  }

  // To remove something from DB
  static async destroy() {}
}

export default ProfileController;
