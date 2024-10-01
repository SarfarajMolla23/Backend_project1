import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public")); // this static is used because if some files or pdf came to me i want to store it in server so we make a public folder that there is one public assets is there anyone can access so make this make this name public.
app.use(cookieParser()); // we need to install cookie-parser for accessing cookies from user browser.

export { app };
