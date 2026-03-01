import express from "express";
import multer from "multer";
import { importMenuFromPDF } from "../controllers/menuImportController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/aimenu/import-pdf
router.post("/import-pdf", upload.single("menuFile"), importMenuFromPDF);

export default router;
