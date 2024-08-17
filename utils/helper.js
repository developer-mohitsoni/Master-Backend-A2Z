// Import supportedMimes that contains the supported file information required to upload
import { supportedMimes } from "../config/filesystem.js";

// Import uuid package for generating unique id of each image
import { v4 as uuidv4 } from "uuid";

import fs from "fs";

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

export const getImageUrl = (imgName) => {
  return `${process.env.APP_URL}/images/${imgName}`;
};

export const removeImage = (imageName) => {
  const path = process.cwd() + "/public/images/" + imageName;

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

  // Now this will upload our image in the given directory
  const uploadPath = process.cwd() + "/public/images/" + imageName;

  image.mv(uploadPath, (err) => {
    if (err) throw err;
  });

  return imageName;
};
