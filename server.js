import express, { urlencoded } from "express";

import "dotenv/config";

const app = express();

import fileUpload from "express-fileupload";

// offers middleware capabilities to secure HTTP headers in HTTP responses
import helmet from "helmet";

import cors from "cors";

import { limitter } from "./config/ratelimiter.js";

const PORT = process.env.PORT || 3000;

//* Middleware:-

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors());
app.use(limitter);

app.get("/", (req, res) => {
  return res.json({
    message: "Hello It's Working...",
  });
});

// Import Routes

import ApiRoutes from "./routes/api.js";
import logger from "./config/logger.js";

app.use("/api", ApiRoutes);

// Jobs import

import "./jobs/index.js"

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
