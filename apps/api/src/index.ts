import { env } from "./config/env.js";
import app from "./app.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `🎵 Melody API running at http://localhost:${env.PORT}`,
  );

  console.log(
    `🏥 Health check: http://localhost:${env.PORT}/api/v1/health`,
  );

  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down...`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));