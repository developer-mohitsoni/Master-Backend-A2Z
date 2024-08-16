// Import supportedMimes that contains the supported file information required to upload
import { supportedMimes } from "../config/filesystem.js";

// Import uuid package for generating unique id of each image
import { v4 as uuidv4 } from "uuid";

import fs from "fs";

// This function is used for to check image validating that takes two argument (size, mime) where size => size of the file in bytes and mime => type of file
export const imageValidator = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2MB";

    // If the given file type is not include in supportedMimes then
  } else if (!supportedMimes.includes(mime)) {
    return "Image must be type of png, jpg, jpeg, svg, jpeg, wpeg...";
  }

  // Here we return null becuase if the file size is less than 2MB AND it include in the supportedMime type then return "null"
  return null;
};

// This function convert bytes to MB
export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

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
