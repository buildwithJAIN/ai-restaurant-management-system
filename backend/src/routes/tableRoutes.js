import express from "express";
import { createTable, getAllTables,updateTable,getTablesByWaiter, checkWaiterTables,getAvailableTables } from "../controllers/tableController.js";

const router = express.Router();

// 🟢 Create new table
router.post("/", createTable);

// 🟤 Get all tables (optional, for manager view)
router.get("/", getAllTables);

router.put("/:id", updateTable);

router.get("/waiter/:waiterId", getTablesByWaiter);
router.get('/check-waiter/:waiterId', checkWaiterTables);
router.get('/available', getAvailableTables);




export default router;
