// index.js
import express from "express";
import cors from "cors";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

//  Allow requests from frontend (5173)
app.use(
  cors({
    origin: "https://ai-chatbot-frontend-a0fo.onrender.com", //frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory vector DB
let vectorDB = [];

// Convert text into embeddings
async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Cosine similarity
function cosineSim(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

// Load PDF on server startup
async function loadPDF() {
  try {
    const pdfPath = path.resolve(__dirname, "career.pdf");
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    const chunks = pdfData.text.match(/(.|[\r\n]){1,500}/g) || [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      vectorDB.push({ text: chunk, embedding });
    }

    console.log(`✅ PDF loaded and ${vectorDB.length} chunks stored.`);
  } catch (error) {
    console.error("❌ Error loading PDF:", error);
  }
}

// API to ask chatbot
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const qEmbedding = await getEmbedding(question);

    const context = vectorDB
      .map(obj => ({ ...obj, score: cosineSim(qEmbedding, obj.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(obj => obj.text)
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Use the following context to answer the question, and if the answer is not directly available in the context then use your own intelligence and give appropriate and correct answer. Don't use assterics (*) symbol while answering:\n${context}\n\nQuestion: ${question}`;
    const result = await model.generateContent(prompt);

    res.json({ answer: result.response.text() });
  } catch (error) {
    console.error("❌ Error in /ask:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log("🚀 Server running on https://ai-chatbot-frontend-a0fo.onrender.com");
  loadPDF();
});
