import PDFParser from "pdf2json";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { openai } from "../config/openai.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ Save images in backend/uploads ONLY
const MENU_UPLOAD_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(MENU_UPLOAD_DIR)) {
  fs.mkdirSync(MENU_UPLOAD_DIR, { recursive: true });
}

// -----------------------------
// 📌 Extract PDF text
// -----------------------------
const extractTextFromPDF = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));

    pdfParser.on("pdfParser_dataReady", (pdf) => {
      const text = pdf.Pages.map((page) =>
        page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" ")
      ).join("\n");

      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
};

// -----------------------------
// ⭐ MAIN IMPORT FUNCTION
// -----------------------------
export const importMenuFromPDF = async (req, res) => {
  try {
    // 1️⃣ PDF validation
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // 2️⃣ Extract text from PDF
    const extractedText = await extractTextFromPDF(req.file.buffer);

    // 3️⃣ Fetch valid categories
    const categoriesFromDB = await prisma.category.findMany({
      select: { name: true }
    });
    const allowedCategories = categoriesFromDB.map(c => c.name);

    // 4️⃣ ⭐ Fetch user-defined prompt from DB (menu_import)
    const promptRecord = await prisma.aIPrompt.findFirst({
      where: { type: "menu_import", active: true }
    });

    if (!promptRecord) {
      return res.status(400).json({
        error: "No menu_import prompt found. Please configure it in Settings."
      });
    }

    // 5️⃣ Build final AI prompt by injecting categories + extracted PDF text
    let finalPrompt = promptRecord.prompt
      .replace(/{{categories}}/gi, allowedCategories.join(", "))
      .replace(/{{menu_text}}/gi, extractedText);

    // If user forgot placeholders, append them safely
    if (!finalPrompt.includes(extractedText)) {
      finalPrompt += `\n\nMenu text:\n"""${extractedText}"""`;
    }
    console.log(finalPrompt)
    // 6️⃣ Call OpenAI to extract JSON
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: finalPrompt }],
      temperature: 0,
    });

    const aiOutput = completion.choices[0].message.content.trim();

    // 7️⃣ Parse AI JSON
    let menuItems = [];
    try {
      menuItems = JSON.parse(
        aiOutput.replace(/```json|```/g, "")
      );
    } catch (err) {
      return res.status(500).json({
        error: "AI returned invalid JSON",
        rawOutput: aiOutput
      });
    }

    const recordsForDb = [];

    // 8️⃣ LOOP — Generate images + prepare DB records
    for (const item of menuItems) {
      const itemName = item.itemName?.trim();
      const category = item.category?.trim();
      const description = item.description?.trim();
      const imagePrompt = item.imagePrompt?.trim();

      if (!itemName || !category) continue;

      let price = parseFloat(String(item.price).replace(/[^0-9.]/g, ""));
      if (isNaN(price)) price = 0;

      let imageUrl = null;

      try {
        const imgResponse = await openai.images.generate({
          model: "gpt-image-1",
          prompt: imagePrompt || `A restaurant-style high-quality food photograph of ${itemName}.`,
          size: "1024x1024",
        });

        const base64 = imgResponse.data[0].b64_json;
        if (base64) {
          const buffer = Buffer.from(base64, "base64");
          const safeName = itemName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
          const fileName = `${safeName}.png`;
          const filePath = path.join(MENU_UPLOAD_DIR, fileName);
          fs.writeFileSync(filePath, buffer);

          imageUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
        }
      } catch (imgErr) {
        console.error("❌ Image Generation Error:", imgErr);
      }

      recordsForDb.push({
        itemName,
        category,
        price,
        description,
        totalAvailable: 100,
        imageUrl,
      });
    }

    // 9️⃣ Save all items to DB
    if (recordsForDb.length > 0) {
      await prisma.menuItem.createMany({
        data: recordsForDb,
        skipDuplicates: true,
      });
    }

    // 🔟 Return response
    res.json({
      message: "Menu imported successfully 🎉",
      imported: recordsForDb.length,
      items: recordsForDb,
    });

  } catch (err) {
    console.error("❌ Import Error:", err);
    res.status(500).json({ error: err.message });
  }
};

