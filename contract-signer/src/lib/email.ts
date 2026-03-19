import { Resend } from "resend";
import { getAppUrl } from "./utils";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_your_api_key_here") {
    throw new Error(
      "RESEND_API_KEY is not configured. Please set it in your .env file."
    );
  }
  return new Resend(apiKey);
}

const getFromAddress = () =>
  process.env.EMAIL_FROM || "NETkyu Contract Signer <office@netkyu.com>";

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

  const resend = getResend();
  console.log(`[Email] Sending signing email via Resend...`);
  console.log(`[Email]   From: ${getFromAddress()}`);
  console.log(`[Email]   To: ${signerEmail}`);
  console.log(`[Email]   API Key: ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: signerEmail,
    subject: `${senderName} has sent you "${documentName}" to sign`,
    html,
  });

  console.log(`[Email] Resend response:`, JSON.stringify({ data, error }, null, 2));

  if (error) {
    console.error("[Email] Resend error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log(`[Email] Sent successfully via Resend. ID: ${data?.id}`);
}

/**
 * Send the completed/signed document to a recipient with the signed PDF attached.
 * Used for BOTH the sender and each signer after all signatures are collected.
 */
export async function sendCompletionEmail(
  recipientEmail: string,
  recipientName: string,
  documentName: string,
  documentId: string,
  signedPdfBuffer?: Buffer
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
          <div class="success">All parties have signed "${documentName}"</div>
          <p>The signed document is attached to this email as a PDF.${documentUrl ? ` You can also <a href="${documentUrl}" style="color: #2563eb;">view it online</a>.` : ""}</p>
          ${signedPdfBuffer ? '<p style="font-size: 13px; color: #6b7280;">Please save the attached PDF for your records.</p>' : ""}
        </div>
        <div class="footer">
          <p>Sent via NETkyu Contract Signer</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailPayload: Parameters<Resend["emails"]["send"]>[0] = {
    from: getFromAddress(),
    to: recipientEmail,
    subject: `Completed: "${documentName}" — signed by all parties`,
    html,
  };

  // Attach signed PDF if available
  if (signedPdfBuffer) {
    emailPayload.attachments = [
      {
        filename: `${documentName} - Signed.pdf`,
        content: signedPdfBuffer,
      },
    ];
  }

  const resend = getResend();
  const { data, error } = await resend.emails.send(emailPayload);

  if (error) {
    console.error("[Email] Resend error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log(`[Email] Completion email sent to ${recipientEmail} via Resend. ID: ${data?.id}`);
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

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: signerEmail,
    subject: `Reminder: "${documentName}" needs your signature`,
    html,
  });

  if (error) {
    console.error("[Email] Resend error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log(`[Email] Reminder email sent via Resend. ID: ${data?.id}`);
}
