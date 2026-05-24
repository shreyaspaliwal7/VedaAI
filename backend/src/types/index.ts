export type GenerationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type QuestionType =
  | "Multiple Choice Questions"
  | "Short Questions"
  | "Diagram/Graph-Based Questions"
  | "Numerical Problems"
  | "Long Answer Questions"
  | "True/False Questions";

export interface QuestionBlockInput {
  type: QuestionType;
  noOfQuestions: number;
  marks: number;
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: PaperSection[];
  answerKey: AnswerItem[];
}

export interface PaperSection {
  title: string;
  instructions: string;
  questions: Question[];
}

export interface Question {
  number: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
  text: string;
  marks: number;
}

export interface AnswerItem {
  number: number;
  answer: string;
}

export interface CreateAssignmentBody {
  title?: string;
  dueDate: string;
  additionalInfo?: string;
  subject?: string;
  className?: string;
  school?: string;
  questionBlocks: QuestionBlockInput[];
}

export interface StatusUpdatePayload {
  assignmentId: string;
  status: GenerationStatus;
  error?: string;
}
