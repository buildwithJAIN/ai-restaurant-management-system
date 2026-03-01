import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log(GEMINI_API_KEY)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
