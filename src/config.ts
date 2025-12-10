import type { MigrationConfig } from "drizzle-orm/migrator";

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
};


type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
}

type APIConfig = {
    fileServerHits: number;
    db: DBConfig;
    platform: string;
    jwtSecret:string;
    polkaAPIKey:string;
};



process.loadEnvFile();

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export const config: APIConfig = {
    fileServerHits: 0,
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    },
    platform: envOrThrow("PLATFORM"),
    jwtSecret: envOrThrow("JWTSECRET"),
    polkaAPIKey: envOrThrow("POLKA_KEY"),
};
