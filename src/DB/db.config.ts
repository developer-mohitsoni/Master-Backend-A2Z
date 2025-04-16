import { withAccelerate } from "@prisma/extension-accelerate";
import { withOptimize } from "@prisma/extension-optimize";
import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient({
	log: ["query", "error"]
})
	.$extends(withAccelerate())
	.$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY as string }));

export default prisma;
