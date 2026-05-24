import { GoogleGenAI, Type, Schema } from "@google/genai";
import { env } from "../config/env";
import { IQuestionBlock } from "../models/Assignment";
import { GeneratedPaper } from "../types";

// Explicitly define the Gemini responseSchema using the new SDK's format
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    schoolName: { type: Type.STRING },
    subject: { type: Type.STRING },
    className: { type: Type.STRING },
    timeAllowed: { type: Type.STRING },
    maxMarks: { type: Type.INTEGER },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          instructions: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                number: { type: Type.INTEGER },
                difficulty: { 
                  type: Type.STRING, 
                  enum: ["Easy", "Moderate", "Challenging"] 
                },
                text: { type: Type.STRING },
                marks: { type: Type.INTEGER }
              },
              required: ["number", "difficulty", "text", "marks"]
            }
          }
        },
        required: ["title", "instructions", "questions"]
      }
    },
    answerKey: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.INTEGER },
          answer: { type: Type.STRING }
        },
        required: ["number", "answer"]
      }
    }
  },
  required: [
    "schoolName",
    "subject",
    "className",
    "timeAllowed",
    "maxMarks",
    "sections",
    "answerKey"
  ]
};

function buildUserPrompt(params: {
  title: string;
  dueDate: string;
  additionalInfo?: string;
  subject?: string;
  className?: string;
  school?: string;
  questionBlocks: IQuestionBlock[];
  totalMarks: number;
}): string {
  const blocksDescription = params.questionBlocks
    .map(
      (b, i) =>
        `Section ${i + 1} (${b.type}): Create exactly ${b.noOfQuestions} questions, each worth ${b.marks} marks.`
    )
    .join("\n");

  return `Create an academic exam question paper with the following parameters:

Title: ${params.title}
Due Date: ${params.dueDate}
School Name: ${params.school ? params.school : `[EXAMINER INSTRUCTION: Extract the school name from the Title "${params.title}" or Additional Info if mentioned. If not mentioned, default to "Delhi Public School"]`}
Subject: ${params.subject ? params.subject : `[EXAMINER INSTRUCTION: Extract the subject name from the Title "${params.title}" or the syllabus notes "${params.additionalInfo ?? ""}". You must generate original questions for this extracted subject. Do not default to General Science unless it is actually Science!]`}
Class: ${params.className ? params.className : `[EXAMINER INSTRUCTION: Extract the class/grade level from the Title "${params.title}" or the syllabus notes. If not mentioned, default to "8th Grade"]`}
Time Allowed: Infer reasonably from total marks (typically 1.5 to 2 minutes per mark, e.g., "1 Hour 30 Minutes" or "2 Hours")
Total Marks Target: ${params.totalMarks}

Section-wise Question Layout:
${blocksDescription}

Teacher Context / Syllabus Notes (Use ONLY as source material for questions. Do NOT just copy-paste these instructions as question content):
${params.additionalInfo ?? "Syllabus aligned with CBSE standard curriculum."}

Strict Requirements:
1. Generate highly realistic, syllabus-appropriate exam questions.
2. For multiple choice sections, format options A, B, C, D directly in the question text.
3. Number all questions sequentially and continuously across all sections starting from 1 (e.g., if Section A has Q1-Q4, Section B starts with Q5).
4. Assign exact marks as specified in each question type block.
5. Apply realistic, varied difficulty levels ("Easy", "Moderate", "Challenging") across questions.
6. The "maxMarks" field must sum up to exactly the requested total marks (${params.totalMarks}).
7. The "answerKey" list must contain exactly one answer block for every generated question.`;
}

function validateGeneratedPaper(
  paper: GeneratedPaper,
  questionBlocks: IQuestionBlock[]
): void {
  const expectedCount = questionBlocks.reduce(
    (sum, b) => sum + b.noOfQuestions,
    0
  );
  const actualCount = paper.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  if (actualCount !== expectedCount) {
    throw new Error(
      `Question count mismatch: expected ${expectedCount} questions, but generated ${actualCount}.`
    );
  }

  if (!paper.answerKey || paper.answerKey.length !== expectedCount) {
    throw new Error(
      `Answer key length mismatch: expected ${expectedCount} answers, but got ${paper.answerKey?.length ?? 0}.`
    );
  }
}

export async function generateExamPaper(params: {
  title: string;
  dueDate: string;
  additionalInfo?: string;
  subject?: string;
  className?: string;
  school?: string;
  questionBlocks: IQuestionBlock[];
}): Promise<GeneratedPaper> {
  const totalMarks = params.questionBlocks.reduce(
    (sum, b) => sum + b.noOfQuestions * b.marks,
    0
  );

  const systemInstruction = `You are an elite academic examiner and curriculum author. 
Your task is to draft a clean, high-quality CBSE/ICSE standard school exam paper. 
You must strictly follow the response schema provided and ensure the output is valid JSON.
All questions must be highly original, academically accurate, and clear.`;

  const prompt = buildUserPrompt({ ...params, totalMarks });

  // --- Option A: Use Groq API if GROQ_API_KEY is configured in .env ---
  if (process.env.GROQ_API_KEY) {
    const groqKey = process.env.GROQ_API_KEY.trim();
    console.log(`[AI Service] GROQ_API_KEY detected. Using Groq (Llama 3.3 70B) for generation. Key prefix: ${groqKey.substring(0, 8)}...`);

    const schemaStr = `{
  "schoolName": "string",
  "subject": "string",
  "className": "string",
  "timeAllowed": "string",
  "maxMarks": number,
  "sections": [
    {
      "title": "string (e.g. 'Section A')",
      "instructions": "string (e.g. 'Answer all questions.')",
      "questions": [
        {
          "number": number (sequentially numbered starting from 1 across all sections),
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "text": "string",
          "marks": number
        }
      ]
    }
  ],
  "answerKey": [
    {
      "number": number,
      "answer": "string"
    }
  ]
}`;

    const groqPrompt = `${prompt}\n\nCRITICAL: You must return ONLY a JSON object that strictly adheres to the following structural schema. Do not change any field names, do not omit any required fields, and ensure timeAllowed, className, subject, and schoolName are filled. Here is the exact JSON structure:\n${schemaStr}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: groqPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API returned an error (${response.status}): ${errorText}`);
    }

    const result = (await response.json()) as any;
    const rawText = result.choices?.[0]?.message?.content;
    if (!rawText) {
      throw new Error("Groq API returned an empty completion content");
    }

    let parsed: GeneratedPaper;
    try {
      parsed = JSON.parse(rawText) as GeneratedPaper;
    } catch (err) {
      console.error("Failed to parse Groq response as JSON:", rawText);
      throw new Error("Groq response was not valid JSON");
    }

    validateGeneratedPaper(parsed, params.questionBlocks);
    return parsed;
  }

  // --- Option B: Fallback to Google Gemini API ---
  const apiKey = env.geminiApiKey;
  if (!apiKey) {
    throw new Error("No AI API key is configured. Please provide GROQ_API_KEY or GEMINI_API_KEY in your env file.");
  }

  const modelName = env.geminiModel || "gemini-2.0-flash";
  console.log(`[AI Service] Using Gemini SDK with model: ${modelName}. Key prefix: ${apiKey.substring(0, 8)}...`);

  // Initialize the new GoogleGenAI client
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.1, // Low temperature for maximum deterministic precision
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("Gemini returned an empty response");
  }

  let parsed: GeneratedPaper;
  try {
    parsed = JSON.parse(rawText) as GeneratedPaper;
  } catch (err) {
    console.error("Failed to parse Gemini response as JSON:", rawText);
    throw new Error("Gemini response is not valid JSON");
  }

  validateGeneratedPaper(parsed, params.questionBlocks);
  return parsed;
}
