/*
  Warnings:

  - You are about to drop the column `imageBase64` on the `menuItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menuItems" DROP COLUMN "imageBase64",
ADD COLUMN     "imageUrl" TEXT;
