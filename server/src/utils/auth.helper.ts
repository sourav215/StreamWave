import redis from "@/libs/redis";
import crypto from "crypto";
import { sendEmail } from "@/utils/sendMail/index";

export const sendOtpToEmail = async (
  email: string,
  name: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, "Verify Your Email", template, { name, otp });

  await redis.set(`otp:${email}`, otp, "EX", 5 * 60);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 1 * 60);
};

export const setCookie = (res: any, name: string, value: string,) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
