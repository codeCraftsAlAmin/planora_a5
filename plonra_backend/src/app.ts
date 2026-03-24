import express, { Application, Request, Response } from "express";
import { authRouter } from "./app/modules/auth/auth.route";
import globalErrorHandler from "./app/middleware/globarError";
import { routeError } from "./app/middleware/routeError";
import cors from "cors";
import { envVars } from "./app/config/env";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    allowedHeaders: ["content-type", "authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// auth router
app.use("/api/v1/auth", authRouter);

// base route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

// global error handler
app.use(globalErrorHandler);

// route error handler
app.use(routeError);

export default app;
