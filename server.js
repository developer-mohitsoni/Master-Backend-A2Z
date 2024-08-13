import express from "express";

import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.json({
    message: "Hello It's Working...",
  });
});

// Import Routes

import ApiRoutes from "./routes/api.js";

app.use("/api", ApiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
