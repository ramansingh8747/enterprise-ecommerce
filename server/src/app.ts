import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    application: "Enterprise E-Commerce API",
    version: "1.0.0",
    status: "Running",
  });
});

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Enterprise E-Commerce API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

export default app;