import "dotenv/config";
import express from "express";
import cors from "cors";

import adminRouter from "./routes/admin.mjs";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

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
success: false,
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

const server = app.listen(PORT, "127.0.0.1", () => {
console.log("");
console.log("========================================");
console.log("        JEE-TUBE API SERVER");
console.log("========================================");
console.log(`API:    http://localhost:${PORT}`);
console.log(`Health: http://localhost:${PORT}/api/health`);
console.log(`Admin:  http://localhost:${PORT}/api/admin`);
console.log("========================================");
console.log("");
});

server.on("error", (error) => {
console.error("SERVER START ERROR:", error);
});

process.on("uncaughtException", (error) => {
console.error("UNCAUGHT EXCEPTION:", error);
});

process.on("unhandledRejection", (error) => {
console.error("UNHANDLED REJECTION:", error);
});
