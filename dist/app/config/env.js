import dotenv from "dotenv";
dotenv.config();
const loadEnvVariables = () => {
    const requireEnvVariables = ["PORT", "DB_ATLAS", "NODE_ENV"];
    const missing = requireEnvVariables.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(", ")}.\n` +
            "Create a .env file (see .env.example) or export these vars before running.");
    }
    return {
        PORT: process.env.PORT,
        DB_ATLAS: process.env.DB_ATLAS,
        NODE_ENV: process.env.NODE_ENV,
    };
};
export const envVers = loadEnvVariables();
//# sourceMappingURL=env.js.map