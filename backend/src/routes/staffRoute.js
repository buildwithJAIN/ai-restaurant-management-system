import express from "express";
import { staffController } from "../controllers/staffController.js";
const router = express.Router();

router.post("/", staffController.createStaff);  // manager creates staff
router.get("/", staffController.listStaff);     // view all staff
router.put("/:id", staffController.update);
router.delete("/:id", staffController.remove); // ✅ ensure this exists
router.get("/waiters", staffController.getWaiters);

export default router;
