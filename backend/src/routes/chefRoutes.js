import express from "express";
import {
  getPendingOrders,
  startCooking,
  getChefInProgressOrders, // 👈 this one’s new
  markReady,
  getCompletedOrders, markItemsReady
} from "../controllers/chefController.js";

const router = express.Router();

// Existing routes
router.get("/orders/pending", getPendingOrders);
router.patch("/orders/start/:orderId", startCooking);

// ✅ New route (the one Angular is calling)
router.get("/orders/in-progress/:chefId", getChefInProgressOrders);

router.patch("/orders/ready/:orderId", markReady);
router.get("/orders/completed", getCompletedOrders);
router.patch('/orders/mark-items-ready', markItemsReady);


export default router;
