import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { badRequestError } from "./error.js";

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

export async function handlerChirpsValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params:parameters = req.body;
  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new badRequestError("Chirp is too long. Max length is 140");
  }

  //Clean the chirp here
  const cleanedChirp = cleanChirp(params.body);

  respondWithJSON(res, 200, {
    cleanedBody: cleanedChirp,
  });
}
