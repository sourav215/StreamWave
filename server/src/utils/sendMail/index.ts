import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { AppError } from "@/middleware/error-handler";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const renderEmailTemplate = async (
  templateName: string,
  data: any
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );
  return ejs.renderFile(templatePath, data);
};

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: any
) => {
  try {
    // Validate SMTP credentials before attempting to send
    if (
      !process.env.SMTP_USER ||
      (!process.env.SMTP_PASS && !process.env.SMTP_PASSWORD)
    ) {
      throw new Error(
        "SMTP credentials are missing. Please set SMTP_USER and SMTP_PASS (or SMTP_PASSWORD) environment variables."
      );
    }

    const html = await renderEmailTemplate(templateName, data);
    await transporter.sendMail({
      from: `<${process.env.SMTP_USER}>`,
      to: to,
      subject,
      html,
    });
    return true;
  } catch (error: any) {
    throw new AppError(`Failed to send email: ${error.message}`, 500);
  }
};
