-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "assignedWaiterId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Table_tableNumber_key" ON "Table"("tableNumber");

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_assignedWaiterId_fkey" FOREIGN KEY ("assignedWaiterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
