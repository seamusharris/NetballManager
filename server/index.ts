import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { addSeasonsSupport } from "./migrations/addSeasonsSupport";
import { addPlayerSeasonsTable } from "./migrations/addPlayerSeasons";
import { addQueryIndexes } from "./migrations/addQueryIndexes";
import { createGameStatusesTable } from "./migrations/createGameStatusesTable";
import { cleanupLegacyGameColumns } from "./migrations/cleanupLegacyGameColumns";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run migrations
  log("Running database migrations...", "migration");
  try {
    const { addSeasonsSupport } = await import('./migrations/addSeasonsSupport');
    await addSeasonsSupport();

    const { addPlayerSeasonsTable } = await import('./migrations/addPlayerSeasons');
    await addPlayerSeasonsTable();

    const { createGameStatusesTable } = await import('./migrations/createGameStatusesTable');
    await createGameStatusesTable();

    const { addQueryIndexes } = await import('./migrations/addQueryIndexes');
    await addQueryIndexes();

    const { cleanupLegacyGameColumns } = await import('./migrations/cleanupLegacyGameColumns');
    await cleanupLegacyGameColumns();

    const { addMultiClubSupport } = await import('./migrations/addMultiClubSupport');
    await addMultiClubSupport();

    const { ensureRequiredColumns } = await import('./migrations/ensureRequiredColumns');
    await ensureRequiredColumns();

    const { createClubPlayersTable } = await import('./migrations/createClubPlayersTable');
    await createClubPlayersTable();

    const { migrateExistingDataToMultiClub } = await import('./migrations/migrateToMultiClub');

    console.log("Starting data migration to multi-club...");
    await migrateExistingDataToMultiClub();

    log("Database migrations completed successfully!", "migration");
  } catch (error) {
    log(`Migration error: ${error}`, "migration");
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();