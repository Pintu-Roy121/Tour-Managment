import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import expressSession from "express-session";
import passport from "passport";
import { envVers } from "./app/config/env.js";
import "./app/config/passport.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import { router } from "./app/routes/index.js";

const app = express();

app.use(
  expressSession({
    secret: envVers.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Tour Management System API is running");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
