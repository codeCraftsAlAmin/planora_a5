import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import path from "path";
import ejs from "ejs";
import AppError from "../middleware/appError";
import status from "http-status";

// Create a fresh transporter per invocation — required for serverless (Vercel)
// Do NOT use pool:true; pooled connections are killed between serverless invocations
const createTransporter = () =>
  nodemailer.createTransport({
    host: envVars.SMTP_HOST,
    port: Number(envVars.SMTP_PORT),
    secure: true,
    auth: {
      user: envVars.SMTP_USER,
      pass: envVars.SMTP_PASS,
    },
    connectionTimeout: 8000, // 8s — stay within Vercel's 10s limit
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });

interface ISendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    fileName: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: ISendEmailOptions) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "app",
      "templates",
      `${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    // Create a fresh transporter per call — safe for serverless
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: envVars.SMTP_EMAIL_SENDER,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.fileName,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (err) {
    console.error("Error while sending mail:", err);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
