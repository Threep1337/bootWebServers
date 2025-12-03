import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { parse } from "path";
import { createUser, lookupUserByEmail } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { respondWithJSON } from "./json.js";
import { hashPassword,checkPasswordHash } from "../auth.js";
import { makeJWT } from "../auth.js";

export async function handlerCreateUser(req: Request, res: Response): Promise<void> {
    type parameters = {
        email: string;
        password:string;
    };


    const params: parameters = req.body;

    const user: NewUser = {
        email: params.email,
        hashedPassword: await hashPassword(params.password)
    };

    let createdUser = await createUser(user);

    respondWithJSON(res, 201, createdUser);

}


export async function handlerLoginUser(req: Request, res: Response): Promise<void> {
    type parameters = {
        email: string;
        password:string;
        expiresInSeconds? : number;
    };

    let tokenExpiryTimeSeconds = 60 * 60;




    const params: parameters = req.body;

    if (params.expiresInSeconds && params.expiresInSeconds < tokenExpiryTimeSeconds && params.expiresInSeconds > 0){
        tokenExpiryTimeSeconds = params.expiresInSeconds;
    }

    const userLookup = await lookupUserByEmail(params.email);

    
    if (!userLookup)
    {
        console.log("No user found in DB");
        res.status(401).send();
    }

    //console.log (`GivenPass: ${params.password} HashedPass: ${userLookup.hashedPassword}`);
    const computedHash = await hashPassword(params.password);
    //console.log (`ComputedHash: ${computedHash}`);

    if (await checkPasswordHash(params.password,userLookup.hashedPassword))
    {
          //const { hashedPassword, ...safeResponse } = userLookup;
            //respondWithJSON(res, 200, safeResponse);
        const token = makeJWT(userLookup.id,tokenExpiryTimeSeconds,config.jwtSecret);
        console.log(`Computed token value is: ${token}`);
        

        const safeResponse = {
            id: userLookup.id,
            createdAt: userLookup.createdAt,
            updatedAt:userLookup.updatedAt,
            email: userLookup.email,
            token: token
            };


        respondWithJSON(res, 200, safeResponse);
        
    }
    else
    {
        console.log("Password mismatch");
        res.status(401).send();
    }


}
