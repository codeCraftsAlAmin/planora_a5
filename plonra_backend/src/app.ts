import express, { Application, Request, Response } from "express";
import { authRouter } from "./app/modules/auth/auth.route";
import globalErrorHandler from "./app/middleware/globarError";
import { routeError } from "./app/middleware/routeError";
import cors from "cors";
import { envVars } from "./app/config/env";
import cookieParser from "cookie-parser";
import { userRouter } from "./app/modules/users/user.route";
import { adminRouter } from "./app/modules/admin/admin.route";
import qs from "qs";
import path from "path";

const app: Application = express();

// for query builder
app.set("query parser", (str: string) => qs.parse(str));

// for ejs
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

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

// user router
app.use("/api/v1/users", userRouter);

// admin router
app.use("/api/v1/admin", adminRouter);

// base route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

// route error handler
app.use(routeError);

// global error handler
app.use(globalErrorHandler);

export default app;
