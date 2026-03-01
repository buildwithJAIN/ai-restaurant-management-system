import express from "express";
import {
  createReservation,
  getPendingReservations,
  updateReservationStatus,
} from "../controllers/reservationController.js";

const router = express.Router();

/* 🔹 Guest creates a reservation */
router.post("/", createReservation);

/* 🔹 Host dashboard gets all pending */
router.get("/pending", getPendingReservations);

/* 🔹 Host updates reservation (approve/reject) */
router.put("/:id", updateReservationStatus);

export default router;
