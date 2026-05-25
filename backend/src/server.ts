import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server as SocketServer } from "socket.io";
import { env } from "./config/env";
import { connectDatabase } from "./config/db";
import assignmentsRouter from "./routes/assignments";

const app = express();
const httpServer = createServer(app);

const clientOrigin = process.env.CLIENT_ORIGIN ?? env.clientOrigin;
const allowedOrigins = clientOrigin.split(",").map(o => o.trim());

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  const originLower = origin.toLowerCase();
  
  // Check against defined allowed origins
  const matched = allowedOrigins.some(allowed => {
    if (allowed === "*") return true;
    return allowed.toLowerCase() === originLower;
  });
  if (matched) return true;
  
  // Dynamically allow localhost/127.0.0.1
  if (originLower.includes("localhost") || originLower.includes("127.0.0.1")) {
    return true;
  }
  
  // Dynamically allow all Vercel domains for the project
  if (originLower.endsWith(".vercel.app")) {
    return true;
  }
  
  return false;
}

const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Share Socket.io instance with Express to broadcast updates locally
app.set("io", io);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/assignments", assignmentsRouter);

io.on("connection", (socket) => {
  socket.on("assignment:join", (assignmentId: string) => {
    if (typeof assignmentId === "string" && assignmentId.length > 0) {
      socket.join(assignmentId);
    }
  });

  socket.on("assignment:leave", (assignmentId: string) => {
    if (typeof assignmentId === "string" && assignmentId.length > 0) {
      socket.leave(assignmentId);
    }
  });
});

async function bootstrap(): Promise<void> {
  await connectDatabase();

  // In production (or if START_WORKER is set), start the BullMQ worker in the same process
  // to support seamless, free single-instance hosting on platforms like Render.
  if (process.env.NODE_ENV === "production" || process.env.START_WORKER === "true") {
    console.log("[Bootstrap] Starting in-process BullMQ Assessment Worker...");
    try {
      require("./workers/assessmentWorker");
    } catch (err) {
      console.error("[Bootstrap] Failed to initialize in-process worker:", err);
    }
  }

  httpServer.listen(env.port, () => {
    console.log(`API server listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
