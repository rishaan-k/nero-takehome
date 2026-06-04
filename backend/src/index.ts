import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { env } from "./env.js";
import partiesRouter from "./routes/parties.js";
import songsRouter from "./routes/songs.js";
import { setupSocketHandlers } from "./sockets/index.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/parties", partiesRouter);
app.use("/api/songs", songsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

server.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
