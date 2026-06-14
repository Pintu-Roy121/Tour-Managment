import dotenv from "dotenv";
dotenv.config();
const loadEnvVariables = () => {
    const requireEnvVariables = ["PORT", "DB_ATLAS", "NODE_ENV"];
    requireEnvVariables.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Warning: Environment variable ${key} is not set.`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_ATLAS: process.env.DB_ATLAS,
        NODE_ENV: process.env.NODE_ENV,
    };
};
export const envVers = loadEnvVariables();
//# sourceMappingURL=env.js.map