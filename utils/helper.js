// Import supportedMimes that contains the supported file information required to upload
import { supportedMimes } from "../config/filesystem.js";

// Import uuid package for generating unique id of each image
import { v4 as uuidv4 } from "uuid";

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
