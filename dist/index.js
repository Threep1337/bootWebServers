import express from "express";
import { handlerMetrics, handlerReadiness, handlerReset } from "./api/handlers.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
const app = express();
const PORT = 8080;
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/api/metrics", handlerMetrics);
app.use("/api/reset", handlerReset);
app.get("/api/healthz", handlerReadiness);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
