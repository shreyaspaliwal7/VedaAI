import mongoose, { Document, Schema } from "mongoose";
import {
  GenerationStatus,
  GeneratedPaper,
  QuestionType,
} from "../types";

export interface IQuestionBlock {
  type: QuestionType;
  noOfQuestions: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  assignedOn: string;
  dueDate: string;
  subject?: string;
  className?: string;
  school?: string;
  additionalInfo?: string;
  questionBlocks: IQuestionBlock[];
  status: GenerationStatus;
  publishStatus?: "draft" | "published";
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionBlockSchema = new Schema<IQuestionBlock>(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "Multiple Choice Questions",
        "Short Questions",
        "Diagram/Graph-Based Questions",
        "Numerical Problems",
        "Long Answer Questions",
        "True/False Questions",
      ],
    },
    noOfQuestions: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    number: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Challenging"],
      required: true,
    },
    text: { type: String, required: true },
    marks: { type: Number, required: true },
  },
  { _id: false }
);

const paperSectionSchema = new Schema(
  {
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    questions: { type: [questionSchema], required: true },
  },
  { _id: false }
);

const answerItemSchema = new Schema(
  {
    number: { type: Number, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const generatedPaperSchema = new Schema(
  {
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    sections: { type: [paperSectionSchema], required: true },
    answerKey: { type: [answerItemSchema], required: true },
  },
  { _id: false }
);

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    assignedOn: { type: String, required: true },
    dueDate: { type: String, required: true },
    subject: { type: String },
    className: { type: String },
    school: { type: String },
    additionalInfo: { type: String },
    questionBlocks: {
      type: [questionBlockSchema],
      required: true,
      validate: {
        validator: (blocks: IQuestionBlock[]) => blocks.length > 0,
        message: "At least one question block is required",
      },
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    publishStatus: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    generatedPaper: { type: generatedPaperSchema },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const AssignmentModel = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema
);
