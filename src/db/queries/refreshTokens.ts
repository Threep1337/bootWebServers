import { db } from "../index.js";
import { eq, inArray,and,lt,or,isNull,gt } from "drizzle-orm";
import { NewUser, users, refreshTokens, NewRefreshToken } from "../schema.js";
import { date } from "drizzle-orm/mysql-core/index.js";

export async function createRefreshToken(token: string, userID: string, expiresIn: number) {
    const newToken: NewRefreshToken = {
        token: token,
        userId: userID,
        expiresAt: new Date(Date.now() + expiresIn * 1000)
    }
    const [result] = await db
        .insert(refreshTokens)
        .values(newToken)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function getUserFromRefreshToken(token: string) {

    const [result] = await db
        .select()
        .from(users)
        .where(
            inArray(
                users.id,
                db
                    .select({ userId: refreshTokens.userId })
                    .from(refreshTokens)
                    .where(and(eq(refreshTokens.token, token),gt(refreshTokens.expiresAt,new Date()) ,or(gt(refreshTokens.revokedAt,new Date()),isNull(refreshTokens.revokedAt))))
            )
        );

    return result;
}

export async function revokeRefreshToken(token: string) {
    console.log(`About to revoke the token ${token}`)
    const [result] = await db
        .update(refreshTokens).set({revokedAt:new Date()}).where(eq(refreshTokens.token,token)).returning();
    return result;
}

