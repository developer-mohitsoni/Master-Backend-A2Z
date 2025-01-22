// Import supportedMimes that contains the supported file information required to upload
import { supportedMimes } from "../config/filesystem.js";

import fs from "node:fs";
import path from "node:path";

// Import uuid package for generating unique id of each image
import { v4 as uuidv4 } from "uuid";

// Ye function image ko validate karne ke liye use hota hai jo size aur mime type ko check karta hai
export const imageValidator = (size, mime) => {
  // Agar file ka size 2MB se zyada hai toh error message return karega
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2MB";

    // Agar file ka type supported types mein nahi hai toh error message return karega
  } else if (!supportedMimes.includes(mime)) {
    return "Image must be type of png, jpg, jpeg, svg, gif, webp...";
  }

  // Agar file size 2MB se kam hai aur type supported types mein hai, toh null return karega (no error)
  return null;
};

// Ye function bytes ko MB mein convert karta hai
export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

// Ye function ek random number generate karta hai
export const generateRandomNum = () => {
  return uuidv4();
};

// `getImageUrl` ek utility function hai jo image ka full URL generate karta hai
export const getImageUrl = (imgName) => {
  // Ye line base URL le rahi hai from environment variable `process.env.APP_URL`
  // aur uske aage `/images/` path aur image ka naam jod kar full URL banati hai
  return `${process.env.APP_URL}/images/${imgName}`;
};

// `removeImage` function image ko delete karne ke liye hai
export const removeImage = (imageName) => {
  // Image ka path generate kar rahe hain using `process.cwd()`
  const path = process.cwd() + "/public/images/" + imageName;

  // Agar image path exist karta hai toh usko delete karne ke liye `fs.unlinkSync` ka use kar rahe hain
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

//* Upload Image

export const uploadImage = (image) => {
  // imgExt => returning an array by spliting the name of profile image i.e firstOne => Name of file secondOne => extension of profile image
  const imgExt = image?.name.split(".");

  // This will contains the randomnumber with profile image extension as:- 545542.img, 5453154.wbpeg, 54240.jpeg etc.
  const imageName = generateRandomNum() + "." + imgExt[1];

  // Get the current directory
  const currentDirectory = process.cwd();

  // Define the folder path where the image will be uploaded
  const uploadFolder = path.join(currentDirectory, "public/images");

  // Ensure the folder exists, create it if it doesn't
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }

  // Define the upload path for the image
  const uploadPath = path.join(uploadFolder, imageName);

  // Move the uploaded file to the folder
  image.mv(uploadPath, (err) => {
    if (err) {
      console.error("Error uploading the image:", err);
      throw err;
    }
    console.log("Image uploaded successfully to:", uploadPath);
  });

  return imageName;
};
