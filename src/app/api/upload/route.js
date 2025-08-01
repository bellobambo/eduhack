export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import mammoth from "mammoth"; // For DOCX parsing

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.NEXT_PUBLIC_DEEPSEEKAPI,
});

const MAX_CHARS = 10000;

// Optional: Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const questionCount = parseInt(formData.get("questionCount")) || 5;

    if (!file || typeof file.arrayBuffer !== "function") {
      return withCORS(
        NextResponse.json({ error: "Invalid file upload" }, { status: 400 })
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let fileText = "";

    if (file.name.endsWith(".pdf")) {
      try {
        const pdfData = await pdfParse(buffer);
        if (!pdfData.text || pdfData.text.trim().length === 0) {
          return withCORS(
            NextResponse.json(
              {
                error:
                  "PDF contains no extractable text (may be scanned or image-based)",
              },
              { status: 400 }
            )
          );
        }
        fileText = pdfData.text;
      } catch (pdfError) {
        console.error("PDF Parsing Error:", pdfError);
        return withCORS(
          NextResponse.json({ error: "Failed to parse PDF" }, { status: 400 })
        );
      }
    } else if (file.name.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        fileText = result.value;
        if (!fileText.trim()) {
          return withCORS(
            NextResponse.json(
              { error: "DOCX file contains no extractable text" },
              { status: 400 }
            )
          );
        }
      } catch (docxError) {
        console.error("DOCX Parsing Error:", docxError);
        return withCORS(
          NextResponse.json(
            { error: "Failed to parse DOCX file" },
            { status: 400 }
          )
        );
      }
    } else if (file.name.endsWith(".txt")) {
      fileText = buffer.toString("utf-8");
    } else {
      return withCORS(
        NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
      );
    }

    const truncatedText = fileText.slice(0, MAX_CHARS);
    const prompt = `
Using the following content, generate ${questionCount} multiple-choice questions.

🧠 Format each question like this:
---
### **1. Question text goes here**
A) Option 1  
B) Option 2  
C) Option 3  
D) Option 4  
**Correct Answer:** **C) Option 3**
---

📚 Content:
${truncatedText}
`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI tutor that creates questions and answers.",
        },
        { role: "user", content: prompt },
      ],
    });

    return withCORS(
      NextResponse.json({ result: completion.choices[0].message.content })
    );
  } catch (err) {
    console.error("Upload error:", err);
    return withCORS(
      NextResponse.json({ error: "Failed to process request" }, { status: 500 })
    );
  }
}

// Helper function to add CORS headers
function withCORS(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
