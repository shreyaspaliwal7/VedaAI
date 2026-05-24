export type QuestionType =
  | "Multiple Choice Questions"
  | "Short Questions"
  | "Diagram/Graph-Based Questions"
  | "Numerical Problems"
  | "Long Answer Questions"
  | "True/False Questions";

export interface QuestionBlock {
  id: string;
  type: QuestionType;
  noOfQuestions: number;
  marks: number;
}

export type GenerationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface Assignment {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  subject?: string;
  className?: string;
  school?: string;
  questionBlocks: QuestionBlock[];
  additionalInfo?: string;
  fileUrl?: string;
  /** Legacy UI status; new assignments use generationStatus */
  status: "draft" | "published";
  generationStatus?: GenerationStatus;
  errorMessage?: string;
  generatedPaper?: GeneratedPaper;
}

export interface CreateAssignmentPayload {
  title?: string;
  dueDate: string;
  additionalInfo?: string;
  subject?: string;
  className?: string;
  school?: string;
  questionBlocks: Array<{
    type: QuestionType;
    noOfQuestions: number;
    marks: number;
  }>;
}

export interface AssignmentApiResponse {
  assignmentId: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  subject?: string;
  className?: string;
  school?: string;
  additionalInfo?: string;
  questionBlocks: QuestionBlock[];
  status: GenerationStatus;
  publishStatus?: "draft" | "published";
  generatedPaper: GeneratedPaper | null;
  errorMessage: string | null;
  createdAt?: string;
}

export interface StatusUpdatePayload {
  assignmentId: string;
  status: GenerationStatus;
  error?: string;
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
