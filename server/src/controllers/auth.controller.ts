import { ValidationError } from "@/middleware/error-handler";
import { Request, Response, NextFunction } from "express";
import { prisma } from "@/libs/prisma/index";
import { sendOtpToEmail } from "@/utils/auth.helper";
import { logger } from "@/config/logger";

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
    logger.error(`Registration Error for:${email} - ${error}`);
    return res.status(500).json({
      message: "Registration failed. Please try again later.",
    });
  }
};
