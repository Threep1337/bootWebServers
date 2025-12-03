import * as argon2 from "argon2"
import { JwtPayload } from "jsonwebtoken";
import { unauthorizedError } from "./api/error.js";
import { Request } from "express";
import jwt from "jsonwebtoken";

const { sign, verify } = jwt;
type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
}


export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {

    try{
        return await argon2.verify(hash, password);
    }catch(error)
    {
        return false;
    }

}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {


    const iat = Math.floor(Date.now() / 1000); // issued-at in seconds
    const userPayload: payload = {
        iss: "chirpy",
        sub: userID,
        iat,
        exp: iat + expiresIn, // expiresIn must be in seconds
    };

    return sign(userPayload, secret);
}

// export function validateJWT(tokenString: string, secret: string): string{
//     try {
//         const userPayload = verify(tokenString,secret);
//         return (userPayload.sub as string);
//     } catch (error) {
//         throw unauthorizedError
//     }
// }


export function validateJWT(tokenString: string, secret: string) {
  let decoded: payload;
  try {
    decoded = verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new unauthorizedError("Invalid token");
  }

  if (decoded.iss !== 'chirpy') {
    throw new unauthorizedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new unauthorizedError("No user ID in token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string{

  const authHeader = req.get("Authorization");

  if (authHeader === undefined)
  {
    throw new unauthorizedError("Bearer token missing");
  }

  const token = authHeader.replace("Bearer ","");
  if (token === "")
  {
    throw new unauthorizedError("Bearer token is invalid");
  }
  return token;

}