class ProfileController {
  static async index(req, res) {
    try {
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
  static async store() {}
  static async show() {}
  static async update() {}
  static async destroy() {}
}

export default ProfileController;
