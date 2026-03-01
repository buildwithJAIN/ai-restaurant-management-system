import express from "express";
import {
  getSummaryReport,
  getSalesReport,
  getStaffReport,
  getHistoryReport
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/summary", getSummaryReport);
router.get("/sales", getSalesReport);
router.get("/staff", getStaffReport);
router.get("/history", getHistoryReport);

export default router;
