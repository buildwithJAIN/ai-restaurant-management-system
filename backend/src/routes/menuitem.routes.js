import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();
const baseUrl = `http://localhost:5000` // → http://localhost:5000

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Get all menu items
router.get("/", async (req, res) => {
  const items = await prisma.menuItem.findMany({ where:{available:true},orderBy: { createdAt: "desc" } });
  res.json(items);
});

// Create new menu item
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { itemName, category, price, totalAvailable, description, available } = req.body;
    // const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    console.log(imageUrl)

    const item = await prisma.menuItem.create({
      data: {
        itemName,
        category,
        price: parseFloat(price),
        totalAvailable: parseInt(totalAvailable),
        description: description || "",
        available: available === "true" || available === true,
        imageUrl,
      },
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("❌ Error while creating item:", err);
    res.status(500).json({ message: "Error creating menu item" });
  }
});

// Update menu item
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { itemName, category, price, totalAvailable, description, available, imageUrl: oldImage } = req.body;

    let imageUrl;

    // If user uploaded a new image → use it
    if (req.file) {
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    } else {
      // No new image uploaded → use existing one
      imageUrl = oldImage;
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        itemName,
        category,
        price: parseFloat(price),
        totalAvailable: parseInt(totalAvailable),
        description: description || "",
        available: available === "true" || available === true,
        imageUrl,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error while updating item:", err);
    res.status(500).json({ message: "Error updating menu item" });
  }
});


// Delete menu item
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.menuItem.delete({ where: { id } });
  res.status(204).send();
});

export default router;
