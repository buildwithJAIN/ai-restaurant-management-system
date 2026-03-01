import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* 🔹 Create a new reservation (Guest) */
export const createReservation = async (req, res) => {
  try {
    const { guestName, phone, numPeople, dateTime, specialNotes, preOrders } = req.body;

    const reservation = await prisma.reservation.create({
      data: {
        guestName,
        phone,
        numPeople,
        dateTime: new Date(dateTime),
        specialNotes,
        preOrders,
        status: "Pending",
      },
    });

    res.status(201).json({
      success: true,
      message: "Reservation request submitted successfully.",
      reservation,
    });
  } catch (error) {
    console.error("❌ Error creating reservation:", error);
    res.status(500).json({ success: false, error: "Failed to create reservation." });
  }
};

/* 🔹 Get all pending reservations (Host dashboard) */
export const getPendingReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { status: "Pending" },
      orderBy: { createdAt: "desc" },
    });
    res.json(reservations);
  } catch (error) {
    console.error("❌ Error fetching reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations." });
  }
};

/* 🔹 Update reservation status (Accept / Reject) */
export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tableId } = req.body;

    const updated = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status, tableId },
    });

    res.json({ success: true, message: "Reservation updated successfully.", updated });
  } catch (error) {
    console.error("❌ Error updating reservation:", error);
    res.status(500).json({ error: "Failed to update reservation." });
  }
};
