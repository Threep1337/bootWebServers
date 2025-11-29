import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { parse } from "path";
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { respondWithJSON } from "./json.js";

export async function handlerCreateUser(req: Request, res: Response): Promise<void> {
    type parameters = {
        email: string;
    };


    const params: parameters = req.body;

    const user: NewUser = {
        email: params.email
    };

    let createdUser = await createUser(user);

    respondWithJSON(res, 201, createdUser);

}
