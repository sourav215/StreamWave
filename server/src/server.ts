import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { logger } from "@/config/logger";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { rateLimit } from "express-rate-limit";
import { errorMiddleware } from "@/middleware/error-middleware";

import authRouter from "@/routes/auth.router";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3080;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100),
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  logger.info("Health Check Endpoint Hit");
  res.send("Stream Wave Server is running!");
});

app.use(errorMiddleware);

app.listen(port, () => {
  logger.info(`Server is running at http://${host}:${port}`);
});
