import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";

const port = envVars.PORT || 5000;

let server: Server;

const bootsTrap = async () => {
  try {
    server = app.listen(port, () => {
      console.log(`Server is running on ~ 🚀 http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Failed to start server ~ ❌", error);
    process.exit(error ? 1 : 0);
  }
};

const handleExit = (signal?: string, error?: Error) => {
  if (error) {
    console.error(`❌ ${signal}:`, error);
  }

  if (server) {
    server.close(() => {
      console.log("Server closed ~ 🚨");
      process.exit(error ? 1 : 0);
    });
  }
};

process.on("SIGTERM", () => handleExit("SIGTERM"));
process.on("SIGINT", () => handleExit("SIGINT"));

process.on("uncaughtException", (error) =>
  handleExit("uncaughtException", error as Error),
);
process.on("unhandledRejection", (error) =>
  handleExit("unhandledRejection", error as Error),
);

bootsTrap();
