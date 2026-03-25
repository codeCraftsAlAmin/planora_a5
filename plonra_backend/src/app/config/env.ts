import dotenv from "dotenv";
dotenv.config();

interface envConfig {
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  NODE_ENV: string;
  FRONTEND_URL: string;
  ACCESS_TOKEN_SEC: string;
  REFRESH_TOKEN_SEC: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_EMAIL_SENDER: string;
  CLOUDINARY_SEC: string;
  CLOUDINARY_KEY_NAME: string;
  CLOUDINARY_API_KEY: string;
}

const envVariables = (): envConfig => {
  const requiredVariables = [
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "NODE_ENV",
    "FRONTEND_URL",
    "ACCESS_TOKEN_SEC",
    "REFRESH_TOKEN_SEC",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_EMAIL_SENDER",
    "CLOUDINARY_SEC",
    "CLOUDINARY_KEY_NAME",
    "CLOUDINARY_API_KEY",
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
    NODE_ENV: process.env.NODE_ENV as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    ACCESS_TOKEN_SEC: process.env.ACCESS_TOKEN_SEC as string,
    REFRESH_TOKEN_SEC: process.env.REFRESH_TOKEN_SEC as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: process.env.SMTP_PORT as string,
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_EMAIL_SENDER: process.env.SMTP_EMAIL_SENDER as string,
    CLOUDINARY_SEC: process.env.CLOUDINARY_SEC as string,
    CLOUDINARY_KEY_NAME: process.env.CLOUDINARY_KEY_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  };
};

export const envVars = envVariables();
