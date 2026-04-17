/**
 * Email sending utilities using Resend
 */

import { Resend } from "resend";
import { render } from "@react-email/render";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not set - email sending disabled");
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

export async function sendEmail(options: SendEmailOptions) {
  if (!resend) {
    console.error("Resend not configured - skipping email send");
    return {
      error: "Email service not configured. Please set RESEND_API_KEY.",
    };
  }

  try {
    const html = await render(options.react);

    const { data, error } = await resend.emails.send({
      from: options.from || "Traballo <noreply@traballo.be>",
      to: options.to,
      subject: options.subject,
      html,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Send email error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
