const migrationConfig = {
    migrationsFolder: "./src/db/migrations",
};
process.loadEnvFile();
function envOrThrow(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}
export const config = {
    fileServerHits: 0,
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    },
    platform: envOrThrow("PLATFORM"),
    jwtSecret: envOrThrow("JWTSECRET")
};
