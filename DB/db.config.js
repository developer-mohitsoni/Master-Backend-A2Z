import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { withOptimize } from "@prisma/extension-optimize";

const prisma = new PrismaClient({
  log: ["query", "error"],
})
  .$extends(withAccelerate())
  .$extends(
    withOptimize({
      apiKey: process.env.OPTIMIZE_API_KEY,
    })
  );

export default prisma;
