import PDFDocument from "pdfkit";
import { Response } from "express";

export function generateAssignmentPdf(assignment: any, res: Response): void {
  const paper = assignment.generatedPaper;
  if (!paper) {
    res.status(400).json({ error: "No generated paper found for this assignment" });
    return;
  }

  // Create A4 PDF Document (Width: 595, Height: 842)
  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });

  // Stream PDF to the response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="assessment-${assignment._id}.pdf"`
  );

  doc.pipe(res);

  // Design Theme Colors
  const textColor = "#1F2937";     // Dark slate gray
  const mutedTextColor = "#4B5563"; // Medium gray
  const lineStrokeColor = "#9CA3AF"; // Slate separator lines
  const boxBorderColor = "#D1D5DB"; // Border color

  // --- Title & Header ---
  doc.fillColor(textColor);
  doc.fontSize(18).font("Helvetica-Bold").text(paper.schoolName.toUpperCase(), { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(12).font("Helvetica").text(`Subject: ${paper.subject}`, { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(12).text(`Class / Grade: ${paper.className}`, { align: "center" });
  doc.moveDown(0.6);

  // Separator Line
  doc.strokeColor(lineStrokeColor).lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.6);

  // --- Exam Metadata (Time & Marks Bar) ---
  const metadataY = doc.y;
  doc.fontSize(10).font("Helvetica-Bold").text(`Time Allowed: ${paper.timeAllowed}`, 50, metadataY);
  doc.text(`Maximum Marks: ${paper.maxMarks}`, 400, metadataY, { align: "right" });
  doc.moveDown(1.2);

  // --- Student Details Identification Card Box ---
  const boxTop = doc.y;
  doc.strokeColor(boxBorderColor).lineWidth(1).rect(50, boxTop, 495, 60).stroke();
  
  const line1Y = boxTop + 10;
  const line2Y = boxTop + 32;
  
  doc.font("Helvetica").fontSize(10);
  doc.text("Student Name: ___________________________________", 65, line1Y);
  doc.text("Roll Number: __________________", 370, line1Y);
  doc.text(`Class: ${paper.className}    Section: _________________`, 65, line2Y);
  doc.text(`Date: ${assignment.assignedOn}`, 370, line2Y);
  
  // Set Y coordinate safely below the card box to avoid overlapping
  doc.y = boxTop + 72;

  // Standard Instructions Callout
  doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(mutedTextColor);
  doc.text("Instructions: Read all questions carefully. All questions are compulsory. Marks are indicated against each question.", { width: 495 });
  doc.moveDown(1.5);

  // --- Paper Sections ---
  paper.sections.forEach((section: any, sIdx: number) => {
    // Avoid orphan section headers near bottom of page
    if (doc.y > 680) {
      doc.addPage();
    }

    doc.fillColor(textColor);
    doc.fontSize(12).font("Helvetica-Bold").text(section.title.toUpperCase(), { align: "center" });
    doc.moveDown(0.3);

    // Section Instructions
    if (section.instructions) {
      doc.fontSize(9).font("Helvetica-Oblique").fillColor(mutedTextColor);
      doc.text(section.instructions, { align: "left", width: 495 });
      doc.moveDown(0.4);
    }

    // Section Separator Line (safely offset to prevent text merging)
    const sepY = doc.y + 2;
    doc.strokeColor(boxBorderColor).lineWidth(0.5).moveTo(50, sepY).lineTo(545, sepY).stroke();
    doc.y = sepY + 8;

    // Questions list
    section.questions.forEach((q: any) => {
      // Inline difficulty and text as a single natural string block
      const questionText = `[${q.difficulty}]  ${q.text}`;
      
      // Calculate precise height that the text block will take using PDFKit
      const questionEstimateHeight = doc.heightOfString(questionText, { width: 400 }) + 15;
      
      // Page break check (ensures clean formatting and no orphans)
      if (doc.y + questionEstimateHeight > 750) {
        doc.addPage();
      }

      const currentQY = doc.y;
      
      // 1. Render Marks right-aligned at X=480 first
      doc.fontSize(10).font("Helvetica-Bold").fillColor(textColor);
      doc.text(`[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`, 480, currentQY, { align: "right", width: 65 });
      
      // 2. Render Question Number at X=50
      doc.fontSize(10).font("Helvetica-Bold").fillColor(textColor);
      doc.text(`${q.number}.`, 50, currentQY, { width: 20 });
      
      // 3. Render the entire Question Text at X=75 (with a full 400pt width)
      // This will naturally wrap multiple lines and MCQs, placing doc.y at the absolute bottom
      doc.fontSize(10).font("Helvetica");
      doc.text(questionText, 75, currentQY, { width: 400 });

      doc.moveDown(0.8);
    });

    doc.moveDown(1.5);
  });

  // --- End of exam paper footer note ---
  if (doc.y > 750) {
    doc.addPage();
  }
  doc.moveDown(1.0);
  doc.fontSize(10).font("Helvetica-Bold").fillColor(mutedTextColor).text("***** END OF QUESTION PAPER *****", { align: "center" });

  // --- Answer Key (Appended on a new page) ---
  if (paper.answerKey && paper.answerKey.length > 0) {
    doc.addPage();
    doc.fillColor(textColor);
    doc.fontSize(14).font("Helvetica-Bold").text("ANSWER KEY (FOR TEACHERS)", { align: "center" });
    doc.moveDown(0.4);
    doc.strokeColor(lineStrokeColor).lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.0);

    paper.answerKey.forEach((ans: any) => {
      const answerText = `${ans.answer}`;
      // Calculate precise height of the answer block
      const answerEstimateHeight = doc.heightOfString(answerText, { width: 415 }) + 15;
      
      if (doc.y + answerEstimateHeight > 750) {
        doc.addPage();
      }

      const currentAnsY = doc.y;

      // Render Question indicator on the left side
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text(`Question ${ans.number}:`, 50, currentAnsY, { width: 75 });
      
      // Render the answer text taking the full remaining width (415pt) to prevent left-side squishing
      doc.font("Helvetica");
      doc.text(answerText, 130, currentAnsY, { width: 415 });
      
      doc.moveDown(0.8);
    });
  }

  doc.end();
}
