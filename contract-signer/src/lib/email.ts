import nodemailer from "nodemailer";
import { getAppUrl } from "./utils";

let transporterPromise: Promise<nodemailer.Transporter>;

function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

async function createTransporter(): Promise<nodemailer.Transporter> {
  // If SMTP_PASS is configured with a real key, use production SMTP
  if (process.env.SMTP_PASS && process.env.SMTP_PASS !== "re_your_api_key_here") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.resend.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || "resend",
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development: use Ethereal fake SMTP (emails are captured, not delivered)
  console.log("[Email] No SMTP credentials configured - using Ethereal test account");
  const testAccount = await nodemailer.createTestAccount();
  console.log("[Email] Ethereal test account created:", testAccount.user);
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

const fromAddress =
  process.env.SMTP_FROM || "NETkyu Contract Signer <office@netkyu.com>";

export async function sendSigningEmail(
  signerName: string,
  signerEmail: string,
  documentName: string,
  signingToken: string,
  senderName: string,
  message?: string
) {
  const signingUrl = `${getAppUrl()}/sign/${signingToken}`;

  // Always log signing URL for easy dev access
  console.log(`\n[Email] Signing URL for ${signerName} (${signerEmail}):`);
  console.log(`  ${signingUrl}\n`);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #0f172a; padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
        .body { padding: 32px; }
        .body p { color: #374151; line-height: 1.6; margin: 0 0 16px; }
        .document-name { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-weight: 500; color: #0f172a; }
        .message-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0; color: #92400e; font-size: 14px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .btn-container { text-align: center; margin: 28px 0; }
        .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NETkyu Contract Signer</h1>
        </div>
        <div class="body">
          <p>Hi ${signerName},</p>
          <p><strong>${senderName}</strong> has sent you a document to sign:</p>
          <div class="document-name">${documentName}</div>
          ${message ? `<div class="message-box">${message}</div>` : ""}
          <p>Please review and sign the document by clicking the button below:</p>
          <div class="btn-container">
            <a href="${signingUrl}" class="btn">Review & Sign</a>
          </div>
          <p style="font-size: 13px; color: #6b7280;">If you can't click the button, copy and paste this link into your browser:<br><a href="${signingUrl}" style="color: #2563eb; word-break: break-all;">${signingUrl}</a></p>
        </div>
        <div class="footer">
          <p>Sent via NETkyu Contract Signer</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: fromAddress,
    to: signerEmail,
    subject: `${senderName} has sent you "${documentName}" to sign`,
    html,
  });

  // Log Ethereal preview URL if available
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email] Preview email: ${previewUrl}`);
  }
}

export async function sendCompletionEmail(
  recipientEmail: string,
  recipientName: string,
  documentName: string,
  documentId: string
) {
  const documentUrl = `${getAppUrl()}/documents/${documentId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #0f172a; padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 600; }
        .body { padding: 32px; }
        .body p { color: #374151; line-height: 1.6; margin: 0 0 16px; }
        .success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; color: #166534; text-align: center; font-weight: 500; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .btn-container { text-align: center; margin: 28px 0; }
        .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NETkyu Contract Signer</h1>
        </div>
        <div class="body">
          <p>Hi ${recipientName},</p>
          <div class="success">All signers have signed "${documentName}"</div>
          <p>The document is now complete. You can download the signed PDF from your dashboard.</p>
          <div class="btn-container">
            <a href="${documentUrl}" class="btn">View Document</a>
          </div>
        </div>
        <div class="footer">
          <p>Sent via NETkyu Contract Signer</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: fromAddress,
    to: recipientEmail,
    subject: `"${documentName}" has been signed by all parties`,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email] Preview email: ${previewUrl}`);
  }
}

export async function sendReminderEmail(
  signerName: string,
  signerEmail: string,
  documentName: string,
  signingToken: string,
  senderName: string
) {
  const signingUrl = `${getAppUrl()}/sign/${signingToken}`;

  console.log(`\n[Email] Reminder signing URL for ${signerName} (${signerEmail}):`);
  console.log(`  ${signingUrl}\n`);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #0f172a; padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 600; }
        .body { padding: 32px; }
        .body p { color: #374151; line-height: 1.6; margin: 0 0 16px; }
        .reminder { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0; color: #92400e; text-align: center; font-weight: 500; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .btn-container { text-align: center; margin: 28px 0; }
        .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NETkyu Contract Signer</h1>
        </div>
        <div class="body">
          <p>Hi ${signerName},</p>
          <div class="reminder">Reminder: "${documentName}" is waiting for your signature</div>
          <p><strong>${senderName}</strong> is waiting for you to sign this document. Please review and sign it at your earliest convenience.</p>
          <div class="btn-container">
            <a href="${signingUrl}" class="btn">Review & Sign</a>
          </div>
        </div>
        <div class="footer">
          <p>Sent via NETkyu Contract Signer</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: fromAddress,
    to: signerEmail,
    subject: `Reminder: "${documentName}" needs your signature`,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email] Preview email: ${previewUrl}`);
  }
}
