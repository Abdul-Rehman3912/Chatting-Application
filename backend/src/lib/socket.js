// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin &&
    [
      "http://localhost:5173",
      "https://chatting-application-ivory.vercel.app",
    ].includes(origin)
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatting-application-ivory.vercel.app",
      "https://chatting-application-nmc9222lr-abdul-rehman2661s-projects.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
  pingTimeout: 60000,
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("call-user", ({ to, offer, from, type, name }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", {
        from,
        name,
        offer,
        type,
      });
    }
  });

  socket.on("answer-call", ({ to, answer }) => {
    io.to(to).emit("call-accepted", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = getReceiverSocketId(to) || to;
    io.to(targetSocketId).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ to }) => {
    const targetSocketId = getReceiverSocketId(to) || to;
    io.to(targetSocketId).emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
