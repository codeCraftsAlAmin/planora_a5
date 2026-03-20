import dotenv from "dotenv";
dotenv.config();

interface envConfig {
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

const envVariables = (): envConfig => {
  const requiredVariables = [
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
  ];

  requiredVariables.forEach((v) => {
    if (!process.env[v]) {
      throw new Error(`Missing required environment variable: ${v}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
  };
};

export const envVars = envVariables();
