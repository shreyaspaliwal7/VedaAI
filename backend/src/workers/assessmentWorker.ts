import dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import mongoose from "mongoose";
import { env } from "../config/env";
import { createRedisConnection } from "../config/redis";
import { AssignmentModel } from "../models/Assignment";
import { ASSESSMENT_QUEUE_NAME, AssessmentJobData } from "../queues/assessmentQueue";
import { generateExamPaper } from "../services/geminiService";
import { emitAssignmentStatus } from "../services/socketEmitter";

async function processJob(job: Job<AssessmentJobData>): Promise<void> {
  const { assignmentId } = job.data;

  const assignment = await AssignmentModel.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  assignment.status = "PROCESSING";
  await assignment.save();
  emitAssignmentStatus(assignmentId, "PROCESSING");

  try {
    const paper = await generateExamPaper({
      title: assignment.title,
      dueDate: assignment.dueDate,
      additionalInfo: assignment.additionalInfo,
      subject: assignment.subject,
      className: assignment.className,
      school: assignment.school,
      questionBlocks: assignment.questionBlocks,
    });

    assignment.generatedPaper = paper;
    assignment.status = "COMPLETED";
    assignment.errorMessage = undefined;
    await assignment.save();
    emitAssignmentStatus(assignmentId, "COMPLETED");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    assignment.status = "FAILED";
    assignment.errorMessage = message;
    await assignment.save();
    emitAssignmentStatus(assignmentId, "FAILED", message);
    throw err;
  }
}

async function start(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log("Worker: MongoDB connected");

  const worker = new Worker<AssessmentJobData>(
    ASSESSMENT_QUEUE_NAME,
    processJob,
    { connection: createRedisConnection(), concurrency: 2 }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed for assignment ${job.data.assignmentId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `Job ${job?.id} failed for assignment ${job?.data.assignmentId}:`,
      err.message
    );
  });

  console.log("Assessment worker started");
}

start().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
