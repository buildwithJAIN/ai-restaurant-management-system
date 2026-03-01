/*
  Warnings:

  - You are about to drop the column `categoryId` on the `menuItems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."menuItems" DROP CONSTRAINT "menuItems_categoryId_fkey";

-- AlterTable
ALTER TABLE "menuItems" DROP COLUMN "categoryId";
