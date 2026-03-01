import express from "express";
import {
  getActiveBilling,
  getBillingSummary,
  closeBilling,
  getActiveBillingsByWaiter,   // 🔥 NEW
  getAllActiveBillings         // 🔥 For manager / host
} from "../controllers/billingController.js";

const router = express.Router();

/* =====================================================
   MANAGER / HOST: GET ALL ACTIVE BILLINGS
   /billing/all-active
===================================================== */
router.get("/all-active", getAllActiveBillings);

/* =====================================================
   WAITER: GET ACTIVE BILLINGS BY WAITER
   /billing/waiter/:waiterId
===================================================== */
router.get("/waiter/:waiterId", getActiveBillingsByWaiter);

/* =====================================================
   GET ACTIVE BILLING FOR A TABLE
   /billing/table/:tableId
===================================================== */
router.get("/table/:tableId", getActiveBilling);

/* =====================================================
   GET BILLING SUMMARY
   /billing/summary/:billingId
===================================================== */
router.get("/summary/:billingId", getBillingSummary);

/* =====================================================
   CLOSE BILLING
   /billing/close/:billingId
===================================================== */
router.post("/close/:billingId", closeBilling);

export default router;
