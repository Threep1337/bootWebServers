import express from "express";
import { Request, Response, NextFunction } from "express";
import { handlerMetrics, handlerReadiness, handlerReset } from "./api/handlers.js";
import { handlerChirps,handlerDeleteChirp,handlerGetAllChirps, handlerGetSingleChirp } from "./api/chirps.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerCreateUser, handlerLoginUser, handlerRefresh, handlerRevokeRefreshToken, handlerUpdateUser } from "./api/users.js";
import { errorHandler } from "./api/error.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use(async (req, res, next) => {
  try {
    await middlewareLogResponses(req, res, next)
  } catch (err) {
    next(err)
  }
});

app.use(express.json())

app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/admin/metrics", async (req, res, next) => {
  try {
    await handlerMetrics(req, res);
  } catch (err) {
    next(err)
  }
});



app.post("/admin/reset", async (req, res, next) => {
  try {
    await handlerReset(req, res)
  } catch (err) {
    next(err)
  }
});

app.get("/api/healthz", async (req, res, next) => {
  try {
    await handlerReadiness(req, res)
  } catch (err) {
    next(err)
  }
});


app.post("/api/chirps", async (req, res, next) => {
  try {
    await handlerChirps(req, res);
  } catch (err) {
    next(err);
  }
});

app.get("/api/chirps", async (req, res, next) => {
  try {
    await handlerGetAllChirps(req, res);
  } catch (err) {
    next(err);
  }
});


app.get("/api/chirps/:chirpID", async (req, res, next) => {
  try {
    await handlerGetSingleChirp(req, res);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/chirps/:chirpID",async (req, res, next) => {
  try {
    await handlerDeleteChirp(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/users",async (req, res, next) => {
  try {
    await handlerCreateUser(req, res);
  } catch (err) {
    next(err);
  }
});

app.put("/api/users",async (req, res, next) => {
  try {
    await handlerUpdateUser(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/login",async (req, res, next) => {
  try {
    await handlerLoginUser(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/refresh",async (req, res, next) => {
  try {
    await handlerRefresh(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/revoke",async (req, res, next) => {
  try {
    await handlerRevokeRefreshToken(req, res);
  } catch (err) {
    next(err);
  }
});





app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});