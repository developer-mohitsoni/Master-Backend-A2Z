-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "password" TEXT NOT NULL,
    "profilt" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);
