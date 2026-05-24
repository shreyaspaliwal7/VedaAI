import {
  AnswerItem,
  GeneratedPaper,
  PaperSection,
  Question,
  QuestionType,
} from "@/types";

export function generateMockPaper(params: {
  title: string;
  questionBlocks: Array<{
    type: QuestionType;
    noOfQuestions: number;
    marks: number;
  }>;
  additionalInfo?: string;
}): GeneratedPaper {
  let number = 1;
  const sections: PaperSection[] = [];
  const answerKey: AnswerItem[] = [];
  const topic =
    params.additionalInfo?.trim().slice(0, 120) ||
    params.title ||
    "General Assessment";

  params.questionBlocks.forEach((block, sectionIndex) => {
    const questions: Question[] = [];
    const difficulties: Array<"Easy" | "Moderate" | "Challenging"> = [
      "Easy",
      "Moderate",
      "Challenging",
    ];

    for (let i = 0; i < block.noOfQuestions; i++) {
      const difficulty = difficulties[i % difficulties.length];
      questions.push({
        number,
        difficulty,
        text: `[${difficulty}] ${block.type}: Question on "${topic}" (${number}).`,
        marks: block.marks,
      });
      answerKey.push({
        number,
        answer: `Model answer for question ${number}.`,
      });
      number += 1;
    }

    sections.push({
      title: `SECTION ${String.fromCharCode(65 + sectionIndex)} — ${block.type}`,
      instructions: `Answer all questions in this section.\nEach question carries ${block.marks} mark(s).`,
      questions,
    });
  });

  const maxMarks = params.questionBlocks.reduce(
    (sum, b) => sum + b.noOfQuestions * b.marks,
    0
  );

  return {
    schoolName: "Delhi Public School",
    subject: "Science",
    className: "8th",
    timeAllowed: `${Math.max(30, Math.ceil(maxMarks * 0.75))} Minutes`,
    maxMarks,
    sections,
    answerKey,
  };
}
