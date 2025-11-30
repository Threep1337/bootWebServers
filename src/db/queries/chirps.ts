import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { NewUser, users,chirps,NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getAllChirps()
{
  const result = await db.select().from(chirps);
  return result;
}

export async function getChirpByID(chirpID: string)
{
  const [result] = await db.select().from(chirps).where(eq(chirps.id,chirpID));
  return result;
}