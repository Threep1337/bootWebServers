import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { badRequestError } from "./error.js";
import { NewChirp } from "../db/schema.js";
import { createChirp, getAllChirps, getChirpByID } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

function cleanChirp(chirp: string): string {
  const badWords = ['kerfuffle', 'sharbert', 'fornax'];
  const inputChirpArray = chirp.split(" ");

  const cleanedChirpArray = [];

  for (let word of inputChirpArray) {
    if (badWords.includes(word.toLowerCase())) {
      cleanedChirpArray.push("****");
    }
    else {
      cleanedChirpArray.push(word);
    }

  }

  const cleanedChirpString = cleanedChirpArray.join(" ");
  return cleanedChirpString;


}


export async function handlerChirps(req: Request, res: Response) {

  const bearerToken = getBearerToken(req);
  console.log(`bearerToken: ${bearerToken}`);
  const userID = validateJWT(bearerToken,config.jwtSecret);

  const chirp:NewChirp= req.body;

  const maxChirpLength = 140;

  if (chirp.body.length > maxChirpLength) {
    throw new badRequestError("Chirp is too long. Max length is 140");
  }

  //Clean the chirp here
  chirp.body = cleanChirp(chirp.body);
  chirp.id = userID;

  const result = await createChirp(chirp);

   respondWithJSON(res, 201,result);
}

export async function handlerGetAllChirps(req: Request, res: Response) {

  const result = await getAllChirps()

   respondWithJSON(res, 200,result);
}


export async function handlerGetSingleChirp(req: Request, res: Response) {

  const chirpID = req.params.chirpID;

  const result = await getChirpByID(chirpID);
  respondWithJSON(res,200,result);

}
