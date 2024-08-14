import jwt from "jsonwebtoken";

// Ye auth middlewar mera ye check karega yadi mai jabb bhi apne profile yaa kisi or page par jaane ki kosis karunga toh mujhe ek middleware chaiye hi hoga jo ki mere token ko verify karega jab mera user successfully login hoga tab.

const authMiddleware = (req, res, next) => {
  // Yeh line request header mein se "authorization" header ko nikal kar authHeader variable mein store kar rahi hai.
  const authHeader = req.headers.authorization;

  // Yeh check kar raha hai ki agar "authorization" header nahi mila toh error message "Unauthorized" ke saath 401 status code return karega.
  if (authHeader === null || authHeader === undefined) {
    res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }

  // Yeh line "authorization" header se token ko extract kar rahi hai. Token header mein "Bearer " keyword ke baad hota hai.
  const token = authHeader.split(" ")[1];

  //* Verify the JWT Token (Decode Token)

  // Yeh line JWT token ko verify karne ke liye jwt.verify function ka use kar rahi hai.
  // token: Yeh verify karne ke liye token hai.
  // process.env.JWT_SECRET: Yeh ek secret key hai jiska use token ko verify karne ke liye hota hai.
  // (err, user) => { ... }: Yeh ek callback function hai jo verify hone ke baad chalega.
  // Agar error aaya toh "Unauthorized" message return karega.
  // Agar verify ho gaya toh req.user mein user ki information store kar lega.

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    req.user = user;
  });

  // Yeh next middleware ko call karta hai.
  next();
};

export default authMiddleware;

// Yeh code ek middleware function hai jo har request par chalega aur check karega ki user authorized hai ya nahi. Agar user authorized hai toh user ki information req.user mein store kar dega.
