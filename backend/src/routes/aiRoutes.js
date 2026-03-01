import express from "express";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
const prisma = new PrismaClient();
const router = express.Router();

// Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/* -------------------------------------------------------
    GET /api/ai/prompt?type=xxxx
------------------------------------------------------- */
router.get("/prompt", async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ error: "Prompt type is required." });
    }

    const prompt = await prisma.aIPrompt.findFirst({
      where: { type, active: true },
    });

    return res.json(prompt || {});
  } catch (err) {
    console.error("❌ Error fetching AI prompt:", err);
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------
    POST /api/ai/prompt   { type, prompt }
------------------------------------------------------- */
router.post("/prompt", async (req, res) => {
  try {
    const { type, prompt } = req.body;

    if (!type || !prompt || !prompt.trim()) {
      return res
        .status(400)
        .json({ error: "Both 'type' and 'prompt' are required." });
    }

    // Check if prompt type already exists
    const existing = await prisma.aIPrompt.findFirst({
      where: { type },
    });

    let saved;

    if (existing) {
      // Update existing
      saved = await prisma.aIPrompt.update({
        where: { id: existing.id },
        data: { prompt },
      });
    } else {
      // Create new
      saved = await prisma.aIPrompt.create({
        data: {
          type,
          prompt,
          active: true,
        },
      });
    }

    res.json(saved);
  } catch (err) {
    console.error("❌ Error saving AI prompt:", err);
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------
    POST /api/ai/generate-description
    Uses type = "item_description"
------------------------------------------------------- */
router.post("/generate-description", async (req, res) => {
  try {
    const { name, category, imageUrl } = req.body;

    if (!name || !category) {
      return res
        .status(400)
        .json({ error: "Both 'name' and 'category' are required." });
    }

    // Get item_description prompt
    const promptRecord = await prisma.aIPrompt.findFirst({
      where: { type: "item_description", active: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!promptRecord) {
      return res
        .status(400)
        .json({ error: "No 'item_description' prompt found in database." });
    }

    // Fill placeholders
    const filledPrompt = promptRecord.prompt
      .replace(/{{name}}/gi, name)
      .replace(/{{category}}/gi, category);

    const contentParts = [{ text: filledPrompt }];

    if (imageUrl) {
      contentParts.push({ text: `Image URL: ${imageUrl}` });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: contentParts,
        },
      ],
    };

    const response = await fetch(GEMINI_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    const description =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No description generated.";

    res.json({ description });
  } catch (err) {
    console.error("❌ Error generating AI description:", err);
    res.status(500).json({ error: "AI description generation failed." });
  }
});

export default router;
