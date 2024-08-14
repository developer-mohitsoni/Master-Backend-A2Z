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
  static async update() {
    const { id } = req.params;

    const authUser = req.user;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Profile image is required",
      });
    }

    const profile = req.files.profile;

    const message = imageValidator(profile.size, profile.mimetype);

    if (message !== null) {
      return res.status(400).json({
        errors: {
          profile: message,
        },
      });
    }
  }

  // To remove something from DB
  static async destroy() {}
}

export default ProfileController;
