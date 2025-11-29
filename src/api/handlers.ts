import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { parse } from "path";
import { deleteAllUsers } from "../db/queries/users.js";

export async function handlerReadiness(req: Request, res: Response): Promise<void> {

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send('OK');
}

export async function handlerMetrics(req: Request, res: Response): Promise<void> {

    let htmlResponse = `<html>
                        <body>
                            <h1>Welcome, Chirpy Admin</h1>
                            <p>Chirpy has been visited ${config.fileServerHits} times!</p>
                        </body>
                        </html>`

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlResponse);
}

export async function handlerReset(req: Request, res: Response): Promise<void> {

    if (config.platform != "dev")
    {
        res.status(403).send();
    }
    else
    {
        config.fileServerHits = 0;
        deleteAllUsers();
        res.send('OK');
    }
    
}