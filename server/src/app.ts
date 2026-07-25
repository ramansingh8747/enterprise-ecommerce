import express from "express";
import cors from "cors";
import morgan from "morgan";
<<<<<<< HEAD
import authRoutes from "./routes/auth.routes";
=======
>>>>>>> e39b6efb4dfe21f2cbc24576fb7b5badc032a18e

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
<<<<<<< HEAD
app.use("/api/v1/auth", authRoutes);
=======

>>>>>>> e39b6efb4dfe21f2cbc24576fb7b5badc032a18e
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

<<<<<<< HEAD


=======
>>>>>>> e39b6efb4dfe21f2cbc24576fb7b5badc032a18e
export default app;