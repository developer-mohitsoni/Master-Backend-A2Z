import jwt from "jsonwebtoken";

// Ye auth middlewar mera ye check karega yadi mai jabb bhi apne profile yaa kisi or page par jaane ki kosis karunga toh mujhe ek middleware chaiye hi hoga jo ki mere token ko verify karega jab mera user successfully login hoga tab.

// authMiddleware naam ka ek function banaya gaya hai jo request ko process karne se pehle user ko authenticate karega
const authMiddleware = (req, res, next) => {
  // Yeh line request header mein se "authorization" header ko nikal kar authHeader variable mein store kar rahi hai.
  const authHeader = req.headers.authorization;

  // Yeh check kar raha hai ki agar "authorization" header nahi mila toh error message "Unauthorized" ke saath 401 status code return karega.
  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json({
      status: 401, // HTTP status code for unauthorized access
      message: "Unauthorized", // Unauthorized message agar header nahi mila
    });
  }

  // Yeh line "authorization" header se token ko extract kar rahi hai. Token header mein "Bearer " keyword ke baad hota hai.
  const token = authHeader.split(" ")[1];

  //* JWT Token ko verify karna (Decode Token)

  // JWT token ko verify karne ke liye jwt.verify function ka use karte hain
  // token: Yeh verify karne ke liye token hai
  // process.env.JWT_SECRET: Yeh secret key hai jo token ko verify karne ke liye use hoti hai
  // (err, user) => { ... }: Yeh callback function hai jo verify hone ke baad chalega
  // Agar error aaya toh "Unauthorized" message return karega
  // Agar verify ho gaya toh req.user mein user ki information store kar lega

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        status: 401, // Unauthorized access ka HTTP status code
        message: "Unauthorized", // Error message agar token verify nahi hua
      });
    }

    // Yahan pe verify hone ke baad user ki information ko request object mein store kar rahe hain
    req.user = user;
  });

  // Yeh next middleware ko call karta hai, yani ki agle function ko execute karega
  next();
};

export default authMiddleware;

// Yeh code ek middleware function hai jo har request par chalega aur check karega ki user authorized hai ya nahi. Agar user authorized hai toh user ki information req.user mein store kar dega.
