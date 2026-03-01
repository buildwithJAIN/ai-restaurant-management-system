-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingId" INTEGER;

-- CreateTable
CREATE TABLE "Billing" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Unbilled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
