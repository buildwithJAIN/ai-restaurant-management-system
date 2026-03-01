-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "chefId" INTEGER;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
