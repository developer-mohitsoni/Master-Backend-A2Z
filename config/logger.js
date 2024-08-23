import winston, { format } from "winston";
// Winston aur uske format module ko import kar rahe hain

const { combine, timestamp, label, printf } = format;
// Winston ke format methods ko destructure kar rahe hain for easier use

// Custom log format define kar rahe hain using printf
const myFormat = printf(({ level, message, label, timestamp }) => {
  // Yahan return karega ek formatted string jisme timestamp, label, level, aur message included hoga
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// Winston logger create kar rahe hain
const logger = winston.createLogger({
  // Logging level set kiya hai "info", yeh define karega ki minimum kis level ke logs capture honge
  level: "info",

  // Format set kar rahe hain jisme hum combine method use karte hue multiple formats apply kar rahe hain
  format: combine(
    label({ label: "right meow!" }), // Sabhi logs ke saath ek custom label "right meow!" attach kar rahe hain
    timestamp(), // Log ke saath current timestamp include kar rahe hain
    myFormat // Custom format apply kar rahe hain jo humne upar define kiya
  ),

  // Default metadata set kar rahe hain jo har log ke saath jaayegi, yahan service ka naam "user-service" set kiya gaya hai
  defaultMeta: { service: "user-service" },

  // Transports define kar rahe hain jahan logs ko store kiya jayega
  transports: [
    // Agar log level "error" ya usse upar ka hai toh usko "error.log" file mein store kar rahe hain
    new winston.transports.File({ filename: "error.log", level: "error" }),

    // Sabhi logs ko "logs.log" file mein store kar rahe hain
    new winston.transports.File({ filename: "logs.log" }),
  ],
});

// Logger ko export kar rahe hain taaki ise doosri files mein use kar sakein
export default logger;
