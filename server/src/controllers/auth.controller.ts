import { AuthError, ValidationError } from "@/middleware/error-handler";
import { Request, Response, NextFunction } from "express";
import { prisma } from "@/libs/prisma/index";
import { sendOtpToEmail, setCookie } from "@/utils/auth.helper";
import { logger } from "@/config/logger";
import redis from "@/libs/redis";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userRegistration = async (req: Request, res: Response) => {
  const { email, name } = req.body;
  logger.info(`User Registration for:${email}`);
  try {
    if (!email || !name) {
      throw new ValidationError("All fields are required");
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ValidationError("User already exists");
    }

    await sendOtpToEmail(email, name, "user-activation-mail");
    logger.info(`OTP sent to email for:${email}`);
    return res.status(200).json({
      message: "OTP sent to email. Please verify your account",
    });
  } catch (error) {
    logger.error(error, `Registration Error for:${email}`);
    return res.status(500).json({
      message: "Registration failed. Please try again later.",
    });
  }
};

export const verifyUserOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, password, name } = req.body;
    logger.info(`Verifying OTP for:${email}`);
    if (!email || !otp || !password || !name) {
      throw new ValidationError("All fields are required");
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ValidationError("User already exists");
    }

    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
      throw new ValidationError("OTP expired or not found");
    }
    logger.info(`Stored OTP:${storedOtp}, Provided OTP:${otp} for:${email}`);
    if (storedOtp !== otp) {
      throw new ValidationError("Invalid OTP");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    await redis.del(`otp:${email}`);
    await redis.del(`otp_cooldown:${email}`);
    logger.info(`User registered successfully for:${email}`);

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    logger.error(error, `OTP Verification Error for:${req.body.email}`);
    return res.status(500).json({
      message: "OTP verification failed. Please try again later.",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    logger.info(`User Login for:${email}`);
    if (!email || !password) {
      throw new ValidationError("All fields are required");
    }
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      throw new AuthError("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthError("Invalid email or password");
    }
    // generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    // set refresh token in httpOnly cookie
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    logger.info(`User logged in successfully for:${email}`);
    return res.status(200).json({
      message: "User logged in successfully",
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
    });
  } catch (error) {
    logger.error(error, `Login Error for:${req.body.email}`);
    return res.status(500).json({
      message: "Login failed. Please try again later.",
    });
  }
};
