import { config } from "./config.js";
export async function handlerReadiness(req, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send('OK');
}
export async function handlerMetrics(req, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`Hits: ${config.fileserverHits}`);
}
export async function handlerReset(req, res) {
    config.fileserverHits = 0;
    res.send('OK');
}
