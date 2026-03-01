-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Available';

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "guestName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "numPeople" INTEGER NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "specialNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "preOrders" JSONB,
    "tableId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
