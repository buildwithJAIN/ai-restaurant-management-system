/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `menuItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menuItems" DROP COLUMN "imageUrl",
ADD COLUMN     "imageBase64" TEXT;
