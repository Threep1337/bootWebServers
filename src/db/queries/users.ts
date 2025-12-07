import { db } from "../index.js";
import { NewUser, user, users } from "../schema.js";
import { eq } from "drizzle-orm";


type UserResponse = Omit<NewUser, "hashedPassword">;

export async function createUser(user: NewUser): Promise<UserResponse> {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();

  const { hashedPassword, ...safeResponse } = result;

  return safeResponse;
}
export async function updateUser(user: NewUser): Promise<UserResponse> {
  if (!user.id) throw new Error("updateUser requires an id");
  
  const [result] = await db
    .update(users).set({ email: user.email, hashedPassword: user.hashedPassword }).where(eq(users.id, user.id)).returning();

  const { hashedPassword, ...safeResponse } = result;

  return safeResponse;
}

export async function deleteAllUsers() {
  const [result] = await db.delete(users);
}

export async function lookupUserByEmail(email: string): Promise<user> {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}