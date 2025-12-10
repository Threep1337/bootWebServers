import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { parse } from "path";
import { createUser, lookupUserByEmail, updateUser, upgradeUser } from "../db/queries/users.js";
import { NewUser, user } from "../db/schema.js";
import { respondWithJSON } from "./json.js";
import { hashPassword, checkPasswordHash, makeRefreshToken, getBearerToken, validateJWT,getAPIKey } from "../auth.js";
import { makeJWT } from "../auth.js";
import { getUserFromRefreshToken, revokeRefreshToken } from "../db/queries/refreshTokens.js";
import { notFoundError, unauthorizedError } from "./error.js";

export async function handlerCreateUser(req: Request, res: Response): Promise<void> {
    type parameters = {
        email: string;
        password: string;
    };


    const params: parameters = req.body;

    const user: NewUser = {
        email: params.email,
        hashedPassword: await hashPassword(params.password)
    };

    let createdUser = await createUser(user);

    respondWithJSON(res, 201, createdUser);

}

export async function handlerUpdateUser(req: Request, res: Response): Promise<void> {
    type parameters = {
        email: string;
        password: string;
    };

    const accessToken = getBearerToken(req);
    const userFromToken = validateJWT(accessToken,config.jwtSecret);
    const params: parameters = req.body;


    // Now we have the users ID, email, and password, so we can update them.

    const user: NewUser = {
        id: userFromToken,
        email: params.email,
        hashedPassword: await hashPassword(params.password)
    };

    let updatedUser = await updateUser(user);

    respondWithJSON(res, 200, updatedUser);

}


export async function handlerLoginUser(req: Request, res: Response): Promise<void> {
    type parameters = {
        email: string;
        password: string;
    };

    let tokenExpiryTimeSeconds = 60 * 60;
    const params: parameters = req.body;
    const userLookup = await lookupUserByEmail(params.email);


    if (!userLookup) {
        console.log("No user found in DB");
        res.status(401).send();
    }

    //console.log (`GivenPass: ${params.password} HashedPass: ${userLookup.hashedPassword}`);
    const computedHash = await hashPassword(params.password);
    //console.log (`ComputedHash: ${computedHash}`);

    if (await checkPasswordHash(params.password, userLookup.hashedPassword)) {

        const token = makeJWT(userLookup.id, tokenExpiryTimeSeconds, config.jwtSecret);
        console.log(`Computed token value is: ${token}`);
        const refreshExpireTimeSeconds = 60 * 60 * 24 * 60;
        // Create the refresh token and put it in the DB
        console.log("Right before creating the refresh token");
        const refreshToken = await makeRefreshToken(userLookup.id, refreshExpireTimeSeconds);
        console.log("Right after the refresh token was created");

        const safeResponse = {
            id: userLookup.id,
            createdAt: userLookup.createdAt,
            updatedAt: userLookup.updatedAt,
            email: userLookup.email,
            token: token,
            refreshToken: refreshToken,
            isChirpyRed:userLookup.isChirpyRed
        };


        respondWithJSON(res, 200, safeResponse);

    }
    else {
        console.log("Password mismatch");
        res.status(401).send();
    }


}


export async function handlerRefresh(req: Request, res: Response): Promise<void> {
    const refreshToken = getBearerToken(req);
    console.log (`The refresh token found in the request was ${refreshToken}`)

    const user: user = await getUserFromRefreshToken(refreshToken);
   // console.log(`The user returned is ${user.id}`);

    let tokenExpiryTimeSeconds = 60 * 60;
    if (user) {
        const token = makeJWT(user.id, tokenExpiryTimeSeconds, config.jwtSecret);
        respondWithJSON(res,200,{token:token});
    }
    else {
        throw new unauthorizedError("Invalid refresh token");
    }

}

export async function handlerRevokeRefreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = getBearerToken(req);

    revokeRefreshToken(refreshToken);

    await getUserFromRefreshToken(refreshToken);

    res.status(204).send();

}

export async function handlerUpgradeUser(req: Request, res: Response): Promise<void> {
    type parameters = {
        event: string;
        data: {
            userId: string
        };
    };

    const apiKey = getAPIKey(req);

    if (apiKey != config.polkaAPIKey){
        throw new unauthorizedError("Bad API Key");
    }

    //const accessToken = getBearerToken(req);
    //const userFromToken = validateJWT(accessToken,config.jwtSecret);
    const params: parameters = req.body;

    console.log(`the event is ${params.event}`)
    if (params.event != 'user.upgraded')
    {
        res.status(204).send();
        return;
    }

    const result = await upgradeUser(params.data.userId);

    if (result){
        res.status(204).send();
    }else
    {
        throw new notFoundError("No user found");
    }

}