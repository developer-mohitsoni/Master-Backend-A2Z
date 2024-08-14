import { imageValidator } from "../utils/helper.js";

class ProfileController {
  // For getting user information from DB
  static async index(req, res) {
    try {
      // Jo humne payload mai paas kiya tha at the time of creating token via jwt wohi payload mujhe req.user mai milega yahan
      const user = req.user;

      return res.json({
        status: 200,
        message: "Profile fetched successfully",
        user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Something Went Wrong...",
      });
    }
  }

  // To store something in DB
  static async store() {}

  // To fetch single record from DB
  static async show() {}

  // To update something from DB
  static async update(req, res) {
    // ye meri id ko fetch karega jo hum url mai paas kar rahe honge using req.params.id ki madad se.
    const { id } = req.params;

    // ue mera user ko dikhayega ji ki abhi login hua hai
    const authUser = req.user;

    // yadi req.file mai ko bhi entry nai hai yaa usko length 0 hai toh return kar do ye
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Profile image is required",
      });
    }

    // ye meri profile naame ke label ko show kar raha hai jo ki hum label mai enter karte hai wo
    const profile = req.files.profile;

    // Ye mera ek message return karega from "helper.js" file se jo ki check karega ki user ka image validate hau yaa nai
    const message = imageValidator(profile.size, profile.mimetype);

    // Yadi message khaali hoga to return kardo ye
    if (message !== null) {
      return res.status(400).json({
        errors: {
          profile: message,
        },
      });
    }

    // Agar image validate hogi toh return kar do ye
    return res.json({
      name: profile.name,
      size: profile.size,
      mime: profile.mimetype
    })
  }

  // To remove something from DB
  static async destroy() {}
}

export default ProfileController;
