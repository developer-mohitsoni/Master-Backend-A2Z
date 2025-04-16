import express, {
	type Application,
	type Request,
	type Response,
	json
} from "express";

import "dotenv/config";

const app: Application = express();

import fileUpload from "express-fileupload";

import helmet from "helmet";

import cors from "cors";

// import { limitter } from "./config/ratelimiter.js";

const PORT = process.env.PORT || 3000;

//* Middleware:-

app.use(express.json());
app.use(json());
app.use(
	express.urlencoded({
		extended: false
	})
);
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors());
// app.use(limitter);

app.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Hello It's Working..."
	});
});

// Import Routes

import ApiRoutes from "./routes/api.js";

app.use("/api", ApiRoutes);

// Jobs import

// import "./jobs/index.js";

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
