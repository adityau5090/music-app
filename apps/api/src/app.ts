import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Root endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    name: "Melody API",
    version: "1.0.0",
    status: "running",
  });
});

// API routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);

// Handle unknown routes
app.use(notFoundMiddleware);

// Handle errors (must be last)
app.use(errorMiddleware);

export default app;