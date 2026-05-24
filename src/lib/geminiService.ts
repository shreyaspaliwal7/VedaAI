import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeneratedPaper, QuestionType } from "@/types";

const OUTPUT_SCHEMA = `{
  "schoolName": "string",
  "subject": "string",
  "className": "string",
  "timeAllowed": "string",
  "maxMarks": number,
  "sections": [
    {
      "title": "string",
      "instructions": "string",
      "questions": [
        {
          "number": number,
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "text": "string",
          "marks": number
        }
      ]
    }
  ],
  "answerKey": [{ "number": number, "answer": "string" }]
}`;

type QuestionBlockInput = {
  type: QuestionType;
  noOfQuestions: number;
  marks: number;
};

function buildUserPrompt(params: {
  title: string;
  dueDate: string;
  additionalInfo?: string;
  subject?: string;
  className?: string;
  school?: string;
  questionBlocks: QuestionBlockInput[];
  totalMarks: number;
}): string {
  const blocksDescription = params.questionBlocks
    .map(
      (b, i) =>
        `Section ${i + 1}: "${b.type}" — exactly ${b.noOfQuestions} questions, ${b.marks} marks each`
    )
    .join("\n");

  return `Create a complete academic exam question paper.

Assignment title: ${params.title}
Due date: ${params.dueDate}
School: ${params.school ?? "Delhi Public School"}
Subject: ${params.subject ?? "Infer from title/instructions"}
Class: ${params.className ?? "Infer from title/instructions"}
Total marks: ${params.totalMarks}

REQUIRED SECTION STRUCTURE (one section per line, in order):
${blocksDescription}

Teacher topic / syllabus notes (use only as subject matter — do NOT paste this text as questions):
${params.additionalInfo?.trim() || "Standard CBSE-style assessment."}

CRITICAL RULES:
1. Write original exam questions for every slot in the structure above.
2. Never repeat or quote the teacher notes as question text.
3. Question "text" must be a real question (MCQ must include options A–D in the text where appropriate).
4. Number questions 1, 2, 3… continuously across all sections.
5. Each question's marks must equal its section's marks per question.
6. Vary difficulty (Easy, Moderate, Challenging) within each section.
7. answerKey must have one entry per question with a concise model answer.
8. maxMarks must equal the sum of all question marks.

Return ONLY valid minified JSON matching this schema (no markdown, no code fences):
${OUTPUT_SCHEMA}`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

function validateGeneratedPaper(
  paper: GeneratedPaper,
  questionBlocks: QuestionBlockInput[]
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
      `Question count mismatch: expected ${expectedCount}, got ${actualCount}`
    );
  }
  if (!paper.answerKey || paper.answerKey.length < expectedCount) {
    throw new Error("Answer key is incomplete");
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function generateExamPaper(params: {
  title: string;
  dueDate: string;
  additionalInfo?: string;
  subject?: string;
  className?: string;
  school?: string;
  questionBlocks: QuestionBlockInput[];
}): Promise<GeneratedPaper> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local in the project root (see .env.local.example)."
    );
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const totalMarks = params.questionBlocks.reduce(
    (sum, b) => sum + b.noOfQuestions * b.marks,
    0
  );

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: `You are an expert CBSE school exam paper author.
You output ONLY one minified JSON object parseable by JSON.parse().
You invent original questions aligned to the teacher's topic and each section's question type.
Never output the teacher's instructions as question content.`,
  });

  const result = await model.generateContent(
    buildUserPrompt({ ...params, totalMarks })
  );
  const rawText = result.response.text();
  const jsonText = extractJson(rawText);

  let parsed: GeneratedPaper;
  try {
    parsed = JSON.parse(jsonText) as GeneratedPaper;
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${rawText.slice(0, 200)}`);
  }

  validateGeneratedPaper(parsed, params.questionBlocks);
  return parsed;
}
