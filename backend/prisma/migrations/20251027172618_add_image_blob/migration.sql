/*
  Warnings:

  - The `imageUrl` column on the `menuItems` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "menuItems" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" BYTEA;
