export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "../_utils/openai";

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
    const body = await req.json();
    const question = normalizeText(body.question);
    const selectedAnswer = normalizeText(body.selectedAnswer || body.answer);
    const correctAnswer = normalizeText(body.correctAnswer);
    const context = normalizeText(body.context);

    if (!question || !selectedAnswer) {
      return withCORS(
        NextResponse.json(
          { error: "question and selectedAnswer are required" },
          { status: 400 }
        )
      );
    }

    const prompt = [
      `Question: ${question}`,
      `Student answer: ${selectedAnswer}`,
      correctAnswer ? `Correct answer: ${correctAnswer}` : null,
      context ? `Learning context: ${context}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a patient AI tutor. Explain answers for students in clear, encouraging language. Focus on the core concept, why the correct answer works, and why the student's answer is right or wrong. Keep the explanation concise and avoid giving unrelated extra facts.",
        },
        { role: "user", content: prompt },
      ],
    });

    return withCORS(
      NextResponse.json({
        explanation: completion.choices[0].message.content,
      })
    );
  } catch (err) {
    console.error("Explain error:", err);
    if (err.message === "OPENAI_API_KEY is not configured") {
      return withCORS(
        NextResponse.json(
          { error: "OpenAI API key is not configured" },
          { status: 500 }
        )
      );
    }

    return withCORS(
      NextResponse.json({ error: "Failed to explain answer" }, { status: 500 })
    );
  }
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function withCORS(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

