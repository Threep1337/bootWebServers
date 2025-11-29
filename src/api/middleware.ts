import { Request, Response,NextFunction } from "express";
import { config } from "../config.js";

export async function middlewareLogResponses (req: Request, res: Response, next: NextFunction): Promise<void>{

  res.on("finish", () => {
    if (res.statusCode != 200)
    {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
  });
  next();

}

export function middlewareMetricsInc (req: Request, res: Response, next: NextFunction): void{
  config.fileServerHits++;
  next();
}