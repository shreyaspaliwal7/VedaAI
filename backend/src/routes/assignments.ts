import { Router, Request, Response } from "express";
import { AssignmentModel } from "../models/Assignment";
import { getAssessmentQueue } from "../queues/assessmentQueue";
import { createAssignmentSchema, formatDate, isDueDateValid, parseDueDate } from "../validators/assignmentValidator";
import { generateAssignmentPdf } from "../services/pdfGenerator";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const parsed = createAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const data = parsed.data;

  if (!isDueDateValid(data.dueDate)) {
    res.status(400).json({ error: "Invalid due date" });
    return;
  }

  const dueDateObj = parseDueDate(data.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dueDateObj < today) {
    res.status(400).json({ error: "Due date cannot be in the past" });
    return;
  }

  const assignedOn = formatDate(new Date());

  const assignment = await AssignmentModel.create({
    title: data.title ?? "Generated Assessment",
    assignedOn,
    dueDate: data.dueDate,
    subject: data.subject,
    className: data.className,
    school: data.school,
    additionalInfo: data.additionalInfo,
    questionBlocks: data.questionBlocks,
    status: "PENDING",
  });

  await getAssessmentQueue().add("generate", {
    assignmentId: assignment._id.toString(),
  });

  res.status(202).json({
    assignmentId: assignment._id.toString(),
    status: assignment.status,
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const assignment = await AssignmentModel.findById(req.params.id).lean();
  if (!assignment) {
    res.status(404).json({ error: "Assignment not found" });
    return;
  }

  res.json({
    assignmentId: assignment._id.toString(),
    title: assignment.title,
    assignedOn: assignment.assignedOn,
    dueDate: assignment.dueDate,
    subject: assignment.subject,
    className: assignment.className,
    school: assignment.school,
    additionalInfo: assignment.additionalInfo,
    questionBlocks: assignment.questionBlocks,
    status: assignment.status,
    publishStatus: assignment.publishStatus ?? "draft",
    generatedPaper: assignment.generatedPaper ?? null,
    errorMessage: assignment.errorMessage ?? null,
    createdAt: assignment.createdAt,
  });
});

router.post("/:id/regenerate", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { additionalInfo } = req.body;

    const assignment = await AssignmentModel.findById(id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    if (additionalInfo !== undefined) {
      assignment.additionalInfo = additionalInfo;
    }

    assignment.status = "PENDING";
    assignment.generatedPaper = undefined;
    assignment.errorMessage = undefined;
    await assignment.save();

    await getAssessmentQueue().add("generate", {
      assignmentId: assignment._id.toString(),
    });

    const io = req.app.get("io");
    if (io) {
      io.to(id).emit("assignment:status", {
        assignmentId: id,
        status: "PENDING",
      });
    }

    res.json({
      assignmentId: assignment._id.toString(),
      status: assignment.status,
      publishStatus: assignment.publishStatus ?? "draft",
    });
  } catch (err) {
    console.error("Error in regenerate route:", err);
    res.status(500).json({ error: "Failed to regenerate assignment" });
  }
});

router.post("/:id/publish", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await AssignmentModel.findById(id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    assignment.publishStatus = "published";
    await assignment.save();

    res.json({
      assignmentId: assignment._id.toString(),
      status: assignment.status,
      publishStatus: assignment.publishStatus,
    });
  } catch (err) {
    console.error("Error in publish route:", err);
    res.status(500).json({ error: "Failed to publish assignment" });
  }
});

router.get("/:id/pdf", async (req: Request, res: Response) => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    generateAssignmentPdf(assignment, res);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

router.post("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, error } = req.body;

  const io = req.app.get("io");
  if (io) {
    io.to(id).emit("assignment:status", { assignmentId: id, status, error });
  }

  res.json({ ok: true });
});

export default router;
