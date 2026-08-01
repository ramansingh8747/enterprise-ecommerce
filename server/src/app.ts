import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import variantRoutes, {
  productVariantRoutes,
} from "./modules/variant/variant.routes";
import { errorHandler } from "./middleware/error.middleware";


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/products", productVariantRoutes);
app.use("/api/v1/variants", variantRoutes);

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

// Global error handler (must be registered after routes)
app.use(errorHandler);

export default app;
