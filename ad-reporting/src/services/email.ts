import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
  from?: {
    name: string;
    address: string;
  };
  smtpConfig?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

export class EmailService {
  private getTransporter(smtpConfig?: EmailOptions["smtpConfig"]) {
    const host = smtpConfig?.host || process.env.SMTP_HOST || "smtp.gmail.com";
    const port = smtpConfig?.port || parseInt(process.env.SMTP_PORT || "587");
    const user = smtpConfig?.user || process.env.SMTP_USER || "";
    const pass = smtpConfig?.pass || process.env.SMTP_PASS || "";

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = this.getTransporter(options.smtpConfig);

      const fromName = options.from?.name || process.env.EMAIL_FROM_NAME || "AdReport Pro";
      const fromAddress = options.from?.address || process.env.EMAIL_FROM || "reports@youragency.com";

      const result = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  }

  async sendReportEmail(params: {
    to: string | string[];
    clientName: string;
    reportTitle: string;
    dateRange: string;
    summaryHtml: string;
    dashboardUrl?: string;
    pdfBuffer?: Buffer;
    agencyName?: string;
    agencyLogoUrl?: string;
    primaryColor?: string;
    smtpConfig?: EmailOptions["smtpConfig"];
    fromName?: string;
    fromAddress?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const {
      to,
      clientName,
      reportTitle,
      dateRange,
      summaryHtml,
      dashboardUrl,
      pdfBuffer,
      agencyName = process.env.EMAIL_FROM_NAME || "AdReport Pro",
      agencyLogoUrl,
      primaryColor = "#2563eb",
      smtpConfig,
      fromName,
      fromAddress,
    } = params;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .container { max-width: 700px; margin: 0 auto; background: #ffffff; }
    .header { background: ${primaryColor}; padding: 32px; text-align: center; }
    .header img { max-height: 48px; margin-bottom: 12px; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0; }
    .content { padding: 32px; }
    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
    .metrics-grid { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .metrics-grid td { padding: 16px; border: 1px solid #e5e7eb; text-align: center; }
    .metric-value { font-size: 24px; font-weight: 700; color: ${primaryColor}; display: block; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-top: 4px; }
    .metric-change { font-size: 11px; margin-top: 4px; display: block; }
    .metric-change.positive { color: #059669; }
    .metric-change.negative { color: #dc2626; }
    .btn { display: inline-block; padding: 14px 32px; background: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .summary-section { margin: 20px 0; }
    .summary-section h3 { font-size: 16px; color: #1f2937; border-bottom: 2px solid ${primaryColor}; padding-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${agencyLogoUrl ? `<img src="${agencyLogoUrl}" alt="${agencyName}">` : ""}
      <h1>${reportTitle}</h1>
      <p>${dateRange}</p>
    </div>
    <div class="content">
      <p class="greeting">Hi ${clientName},</p>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
        Here is your advertising performance report for the period <strong>${dateRange}</strong>.
        Below is a summary of the key metrics across all your active campaigns.
      </p>

      <div class="summary-section">
        ${summaryHtml}
      </div>

      ${
        dashboardUrl
          ? `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" class="btn">View Full Dashboard</a>
        </div>
      `
          : ""
      }
    </div>
    <div class="footer">
      <p>This report was generated by ${agencyName}</p>
      <p>Powered by AdReport Pro</p>
    </div>
  </div>
</body>
</html>`;

    const attachments: EmailOptions["attachments"] = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `${reportTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    return this.sendEmail({
      to,
      subject: `${reportTitle} - ${dateRange}`,
      html,
      attachments,
      from: fromName && fromAddress ? { name: fromName, address: fromAddress } : undefined,
      smtpConfig,
    });
  }

  generateMetricsSummaryHtml(
    metrics: Array<{
      label: string;
      value: string;
      change?: number;
      platform?: string;
    }>,
    primaryColor = "#2563eb"
  ): string {
    const rows: string[] = [];
    for (let i = 0; i < metrics.length; i += 3) {
      const cells = metrics.slice(i, i + 3).map((m) => {
        const changeHtml = m.change !== undefined
          ? `<span class="metric-change ${m.change >= 0 ? "positive" : "negative"}">${m.change >= 0 ? "+" : ""}${m.change.toFixed(1)}%</span>`
          : "";
        const platformBadge = m.platform
          ? `<span style="font-size:10px;background:#e5e7eb;padding:2px 6px;border-radius:4px;color:#6b7280;">${m.platform}</span>`
          : "";

        return `<td>
          <span class="metric-value" style="color:${primaryColor}">${m.value}</span>
          <span class="metric-label">${m.label}</span>
          ${changeHtml}
          ${platformBadge}
        </td>`;
      });

      while (cells.length < 3) cells.push("<td></td>");
      rows.push(`<tr>${cells.join("")}</tr>`);
    }

    return `<table class="metrics-grid">${rows.join("")}</table>`;
  }
}
