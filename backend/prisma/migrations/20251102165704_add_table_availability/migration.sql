/*
  Warnings:

  - You are about to drop the column `assignedWaiterId` on the `Table` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Table` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Table` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tableNumber` on the `Table` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Table" DROP CONSTRAINT "Table_assignedWaiterId_fkey";

-- DropIndex
DROP INDEX "public"."Table_tableNumber_key";

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "assignedWaiterId",
DROP COLUMN "status",
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "waiterId" INTEGER,
DROP COLUMN "tableNumber",
ADD COLUMN     "tableNumber" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
