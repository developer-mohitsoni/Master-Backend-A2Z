import fs from "node:fs";
import path from "node:path";
import { supportedMimes } from "../config/filesystem.js";

import { v4 as uuidv4 } from "uuid";

export const imageValidator = (size: number, mime: string) => {
	if (bytesToMb(size) > 2) {
		return "Image size must be less than 2MB";
	}
	if (!supportedMimes.includes(mime)) {
		return "Image must be type of png, jpg, jpeg, svg, gif, webp...";
	}
	return null;
};

export const bytesToMb = (bytes: number) => {
	return bytes / (1024 * 1024);
};

export const generateRandomNum = () => {
	return uuidv4();
};

export const getImageUrl = (imgName: string) => {
	return `${process.env.APP_URL}/images/${imgName}`;
};

export const removeImage = (imageName: string) => {
	const path = `${process.cwd()}/public/images/${imageName}`;

	if (fs.existsSync(path)) {
		fs.unlinkSync(path);
	}
};

//* Upload Image

export const uploadImage = (image: any) => {
	const imgExt = image?.name.split(".");

	const imageName = `${generateRandomNum()}.${imgExt[1]}`;

	const currentDirectory = process.cwd();

	const uploadFolder = path.join(currentDirectory, "public/images");

	if (!fs.existsSync(uploadFolder)) {
		fs.mkdirSync(uploadFolder, { recursive: true });
	}

	const uploadPath = path.join(uploadFolder, imageName);

	image.mv(uploadPath, (err: any) => {
		if (err) {
			console.error("Error uploading the image:", err);
			throw err;
		}
		console.log("Image uploaded successfully to:", uploadPath);
	});

	return imageName;
};

export const validatePagination = (page: string, limit: string) => {
	const parsedPage = Number(page) || 1;
	const parsedLimit = Number(limit) || 10;

	return {
		page: parsedPage <= 0 ? 1 : parsedPage,
		limit: parsedLimit <= 0 || parsedLimit > 100 ? 10 : parsedLimit
	};
};
