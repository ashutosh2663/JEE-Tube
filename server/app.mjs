import "dotenv/config";
import express from "express";
import cors from "cors";

import adminRouter from "./routes/admin.mjs";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "JEE-Tube API is running.",
  });
});

app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error("API error:", error);

  res.status(500).json({
    success: false,
    error: error?.message || "Internal server error.",
  });
});

export default app;