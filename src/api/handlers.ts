import { Request, Response,NextFunction } from "express";
import { config } from "./config.js";

export async function handlerReadiness (req: Request, res: Response):Promise<void>{

    res.set('Content-Type','text/plain; charset=utf-8');
    res.send('OK');
}

export async function handlerMetrics (req: Request, res: Response):Promise<void>{

    res.set('Content-Type','text/plain; charset=utf-8');
    res.send(`Hits: ${config.fileserverHits}`);
}

export async function handlerReset (req: Request, res: Response):Promise<void>{

    config.fileserverHits = 0;
    res.send('OK');
}