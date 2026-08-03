import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./database/db";
import { schedulerService } from "./container";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Initialize Background Jobs Scheduler Engine (Module 25.6)
  schedulerService.initialize();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });

  // Graceful Shutdown Hooks
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} signal received. Initiating graceful shutdown...`);
    try {
      await schedulerService.shutdown();
      console.log('[Server] Scheduler service shut down cleanly.');
    } catch (err) {
      console.error('[Server] Error during scheduler shutdown:', err);
    }
    server.close(() => {
      console.log('[Server] HTTP server closed. Process exiting.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startServer();
