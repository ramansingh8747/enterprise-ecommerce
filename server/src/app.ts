import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import variantRoutes, {
  productVariantRoutes,
} from "./modules/variant/variant.routes";
import { productMediaRoutes } from "./modules/media/routes/media.routes";
import inventoryRoutes from "./modules/inventory/routes/inventory.routes";
import orderRoutes from "./modules/order/routes/order.routes";
import wishlistRoutes from "./modules/wishlist/routes/wishlist.routes";
import reviewRoutes from "./modules/review/routes/review.routes";
import notificationRoutes from "./modules/notification/routes/notification.routes";
import fileRoutes from "./modules/file/routes/file.routes";
import searchRoutes from "./modules/search/routes/search.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/products", productVariantRoutes);
app.use("/api/v1/products", productMediaRoutes);
app.use("/api/v1/variants", variantRoutes);
// Inventory APIs (Module 14.8) — requires mount so REST endpoints are reachable
app.use("/api/v1/inventory", inventoryRoutes);
// Order APIs (Module 15.4) — requires mount so POST /orders is reachable
app.use("/api/v1/orders", orderRoutes);
// Wishlist APIs (Module 17.5) — POST /api/v1/wishlist
app.use("/api/v1/wishlist", wishlistRoutes);
// Reviews & Ratings APIs (Module 18.6) — /api/v1/reviews
app.use("/api/v1/reviews", reviewRoutes);
// Notification APIs (Module 19.6) — /api/v1/notifications
app.use("/api/v1/notifications", notificationRoutes);
// File Upload APIs (Module 21.7) — /api/v1/files
app.use("/api/v1/files", fileRoutes);
// Search, Filtering & Pagination API (Module 22.6) — /api/v1/search
app.use("/api/v1/search", searchRoutes);

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
