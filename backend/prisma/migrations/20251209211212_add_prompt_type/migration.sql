/*
  Warnings:

  - Added the required column `type` to the `AIPrompt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIPrompt" ADD COLUMN     "type" TEXT NOT NULL;
