import "dotenv/config";
import app from "./app.mjs";

// =========================================================
// SERVER CONFIGURATION
// =========================================================

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const SERVER_NAME = "JEE-TUBE API SERVER";


// =========================================================
// STARTUP LOG
// =========================================================

function printStartupInfo() {
  console.log("");
  console.log("========================================");
  console.log(`        ${SERVER_NAME}`);
  console.log("========================================");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Host:        ${HOST}`);
  console.log(`Port:        ${PORT}`);
  console.log("");
  console.log(`API:         http://127.0.0.1:${PORT}`);
  console.log(`Health:      http://127.0.0.1:${PORT}/api/health`);
  console.log(`Admin:       http://127.0.0.1:${PORT}/api/admin`);
  console.log("");
  console.log("Server status: READY");
  console.log("========================================");
  console.log("");
}


// =========================================================
// ERROR HANDLING
// =========================================================

function handleServerError(error) {
  console.error("");
  console.error("========================================");
  console.error("        JEE-TUBE SERVER ERROR");
  console.error("========================================");
  console.error(error);
  console.error("========================================");
  console.error("");

  if (error?.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already being used by another process.`
    );
    console.error(
      `Stop the existing server or change PORT in .env.`
    );
  }

  process.exitCode = 1;
}


// =========================================================
// GRACEFUL SHUTDOWN
// =========================================================

function setupShutdown(server) {
  const shutdown = (signal) => {
    console.log("");
    console.log(`Received ${signal}. Shutting down JEE-Tube API...`);

    server.close((error) => {
      if (error) {
        console.error(
          "Error while shutting down server:",
          error
        );

        process.exit(1);
      }

      console.log("JEE-Tube API stopped successfully.");
      process.exit(0);
    });

    // Safety timeout
    setTimeout(() => {
      console.error(
        "Forced shutdown: server did not close in time."
      );

      process.exit(1);
    }, 10_000).unref();
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}


// =========================================================
// UNHANDLED ERRORS
// =========================================================

process.on("uncaughtException", (error) => {
  console.error("");
  console.error("UNCAUGHT EXCEPTION:");
  console.error(error);
});

process.on("unhandledRejection", (reason) => {
  console.error("");
  console.error("UNHANDLED PROMISE REJECTION:");
  console.error(reason);
});


// =========================================================
// START SERVER
// =========================================================

try {
  const server = app.listen(
    PORT,
    HOST,
    () => {
      printStartupInfo();
      setupShutdown(server);
    }
  );

  server.on("error", handleServerError);

} catch (error) {
  handleServerError(error);
}