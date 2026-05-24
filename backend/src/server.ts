import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server as SocketServer } from "socket.io";
import { env } from "./config/env";
import { connectDatabase } from "./config/db";
import assignmentsRouter from "./routes/assignments";

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: env.clientOrigin,
    methods: ["GET", "POST"],
  },
});

// Share Socket.io instance with Express to broadcast updates locally
app.set("io", io);

app.use(
  cors({
    origin: env.clientOrigin,
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
  httpServer.listen(env.port, () => {
    console.log(`API server listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
