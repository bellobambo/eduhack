export const runtime = "nodejs";

import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import mammoth from "mammoth"; // For DOCX parsing
import { getOpenAIClient, OPENAI_MODEL } from "../_utils/openai";

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
    const description = normalizeText(
      formData.get("description") || formData.get("context")
    );

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
${description ? `\nAdditional teacher/student context: ${description}\n` : ""}

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

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
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
    if (err.message === "OPENAI_API_KEY is not configured") {
      return withCORS(
        NextResponse.json(
          { error: "OpenAI API key is not configured" },
          { status: 500 }
        )
      );
    }

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

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}
