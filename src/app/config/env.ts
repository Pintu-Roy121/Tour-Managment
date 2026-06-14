import dotenv from "dotenv";

dotenv.config();

interface TEnvVars {
  PORT?: string;
  DB_ATLAS?: string;
  NODE_ENV?: string;
}
const loadEnvVariables = (): TEnvVars => {
  const requireEnvVariables: string[] = ["PORT", "DB_ATLAS", "NODE_ENV"];

  const missing = requireEnvVariables.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}.\n` +
        "Create a .env file (see .env.example) or export these vars before running.",
    );
  }

  return {
    PORT: process.env.PORT as string,
    DB_ATLAS: process.env.DB_ATLAS as string,
    NODE_ENV: process.env.NODE_ENV as string,
  };
};

export const envVers = loadEnvVariables();
