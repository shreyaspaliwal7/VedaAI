import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis";

export const ASSESSMENT_QUEUE_NAME = "assessment-queue";

export interface AssessmentJobData {
  assignmentId: string;
}

let assessmentQueue: Queue<AssessmentJobData> | null = null;

export function getAssessmentQueue(): Queue<AssessmentJobData> {
  if (!assessmentQueue) {
    assessmentQueue = new Queue<AssessmentJobData>(ASSESSMENT_QUEUE_NAME, {
      connection: createRedisConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return assessmentQueue;
}
