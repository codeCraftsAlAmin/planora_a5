import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import ejs from "ejs";
import AppError from "../middleware/appError";
import status from "http-status";
import { templates } from "./templates";

// Create a fresh transporter per invocation — required for serverless (Vercel)
// Do NOT use pool:true; pooled connections are killed between serverless invocations

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
  },
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
    // Use inlined template strings instead of reading from the filesystem.
    // ejs.renderFile() uses process.cwd() which resolves incorrectly on Vercel serverless.
    const templateString = templates[templateName];
    if (!templateString) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Email template "${templateName}" not found`,
      );
    }

    const html = ejs.render(templateString, templateData);

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
