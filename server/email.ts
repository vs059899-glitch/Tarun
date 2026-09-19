import nodemailer from 'nodemailer';
import { BusinessLead, LeadNotificationRecord } from '../src/types';

export const ADMIN_LEAD_EMAIL = process.env.ADMIN_LEAD_EMAIL || 'vs059899@gmail.com';

interface EmailSendResult {
  success: boolean;
  status: 'delivered' | 'logged' | 'failed';
  messageId?: string;
  error?: string;
  record: LeadNotificationRecord;
}

// Lazy nodemailer transporter
let transporter: any = null;

function getTransporter(): any {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (host && user && pass) {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
      return transporter;
    } catch (err) {
      console.error('[EmailService] Failed to create SMTP transporter:', err);
      return null;
    }
  }

  return null;
}

/**
 * Format the Date and Time in both IST and UTC for clarity
 */
function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const dateFormatted = d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });
    return `${dateFormatted} (IST) / ${d.toISOString()}`;
  } catch {
    return isoString;
  }
}

/**
 * Sends an automatic email notification to vs059899@gmail.com
 * when a new lead is successfully submitted.
 */
export async function sendAdminLeadNotification(lead: BusinessLead): Promise<EmailSendResult> {
  const recipient = ADMIN_LEAD_EMAIL;
  const formattedDate = formatDateTime(lead.created_at || lead.createdAt || new Date().toISOString());
  const fullName = lead.full_name || lead.fullName || 'Anonymous';
  const companyName = lead.company_name || lead.companyName || 'Not specified';
  const phone = lead.phone || 'Not provided';
  const email = lead.email;
  const source = lead.source || 'Chatbot Consultation';
  const uploadedFileStatus = lead.uploaded_file_status || 'No File Uploaded';
  const subject = `[Resa AI] New Lead Notification: ${fullName} (${companyName})`;

  const textContent = `
======================================================================
NEW LEAD NOTIFICATION
Resa AI Assistant & Analytics Platform
======================================================================

You have received a new lead submission from the Resa AI Assistant.

• Full Name: ${fullName}
• Email Address: ${email}
• Company Name: ${companyName}
• Phone Number: ${phone}
• Date and Time: ${formattedDate}
• Source: ${source}
• Whether a file was uploaded: ${uploadedFileStatus}
• Session ID: ${lead.session_id || lead.sessionId || 'N/A'}
• Requirement: ${lead.requirement || 'General enquiry'}
• Product Category: ${lead.productCategory || 'General Cosmetics'}

Link to Admin Portal: ${process.env.APP_URL || 'https://resalifescience.in'}
======================================================================
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Lead Notification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F5F0; margin: 0; padding: 24px; color: #201E1D; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E5DEC9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: #201E1D; color: #FAF7F2; padding: 24px 30px; border-bottom: 2px solid #8C7355; }
    .badge { display: inline-block; background: #8C7355; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }
    .title { margin: 0; font-size: 22px; font-weight: 700; font-family: Georgia, serif; }
    .content { padding: 30px; }
    .row { display: flex; border-bottom: 1px solid #F0EAE1; padding: 12px 0; font-size: 14px; }
    .label { width: 180px; font-weight: 600; color: #706B62; flex-shrink: 0; }
    .value { color: #201E1D; font-weight: 500; word-break: break-word; }
    .file-pill { display: inline-block; background: #FAF5ED; border: 1px solid #DFCBB5; color: #8C7355; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .footer { background: #FAF8F5; border-top: 1px solid #EFEAE1; padding: 18px 30px; text-align: center; font-size: 12px; color: #8C867D; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">New Lead Notification</span>
      <h1 class="title">Resa AI Lead Capture</h1>
    </div>
    <div class="content">
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #F0EAE1;">
          <td style="padding: 12px 0; width: 170px; font-weight: 600; color: #706B62; font-size: 13px;">Full Name</td>
          <td style="padding: 12px 0; font-weight: 600; color: #201E1D; font-size: 14px;">${fullName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F0EAE1;">
          <td style="padding: 12px 0; font-weight: 600; color: #706B62; font-size: 13px;">Email Address</td>
          <td style="padding: 12px 0; font-weight: 600; color: #8C7355; font-size: 14px;"><a href="mailto:${email}" style="color: #8C7355; text-decoration: none;">${email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #F0EAE1;">
          <td style="padding: 12px 0; font-weight: 600; color: #706B62; font-size: 13px;">Company Name</td>
          <td style="padding: 12px 0; color: #201E1D; font-size: 14px;">${companyName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F0EAE1;">
          <td style="padding: 12px 0; font-weight: 600; color: #706B62; font-size: 13px;">Phone Number</td>
          <td style="padding: 12px 0; color: #201E1D; font-size: 14px;">${phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F0EAE1;">
          <td style="padding: 12px 0; font-weight: 600; color: #706B62; font-size: 13px;">Date and Time</td>
          <td style="padding: 12px 0; color: #524E48; font-size: 13px;">${formattedDate}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F0EAE1;">
          <td style="padding: 12px 0; font-weight: 600; color: #706B62; font-size: 13px;">Source</td>
          <td style="padding: 12px 0; color: #524E48; font-size: 13px;">${source}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F0EAE1;">
          <td style="padding: 12px 0; font-weight: 600; color: #706B62; font-size: 13px;">Whether a file was uploaded</td>
          <td style="padding: 12px 0; font-size: 13px;"><span class="file-pill">${uploadedFileStatus}</span></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-weight: 600; color: #706B62; font-size: 13px;">Session ID</td>
          <td style="padding: 12px 0; color: #8C867D; font-size: 12px; font-family: monospace;">${lead.session_id || lead.sessionId || 'N/A'}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      Sent automatically by Resa AI Assistant &bull; resalifescience.in &bull; Bawana, New Delhi
    </div>
  </div>
</body>
</html>
`;

  const notificationRecord: LeadNotificationRecord = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    leadId: lead.lead_id || lead.id,
    recipient,
    subject,
    sentAt: new Date().toISOString(),
    status: 'logged',
    content: {
      fullName,
      email,
      companyName,
      phone,
      dateTime: formattedDate,
      source,
      uploadedFileStatus
    }
  };

  const transport = getTransporter();

  if (transport) {
    try {
      const fromAddress = process.env.SMTP_FROM || `"Resa AI Assistant" <noreply@resalifescience.in>`;
      const info = await transport.sendMail({
        from: fromAddress,
        to: recipient,
        subject,
        text: textContent,
        html: htmlContent
      });

      notificationRecord.status = 'delivered';
      console.log(`[EmailService] Lead notification sent successfully to ${recipient}. MessageId: ${info.messageId}`);
      return {
        success: true,
        status: 'delivered',
        messageId: info.messageId,
        record: notificationRecord
      };
    } catch (err: any) {
      console.error(`[EmailService] Failed to send email via SMTP to ${recipient}:`, err);
      notificationRecord.status = 'failed';
      notificationRecord.error = err.message || 'SMTP delivery failed';
      // Still log to console for visibility
      logToConsole(recipient, subject, textContent);
      return {
        success: false,
        status: 'failed',
        error: err.message,
        record: notificationRecord
      };
    }
  }

  // Fallback: SMTP not configured in environment
  // Log securely to backend server logs and preserve delivery audit record
  notificationRecord.status = 'logged';
  logToConsole(recipient, subject, textContent);

  return {
    success: true,
    status: 'logged',
    record: notificationRecord
  };
}

function logToConsole(recipient: string, subject: string, text: string) {
  console.log(`
┌────────────────────────────────────────────────────────────────────────┐
│ 📧 [LEAD NOTIFICATION DISPATCHED]                                      │
│ Recipient: ${recipient.padEnd(58)}│
│ Subject:   ${subject.substring(0, 58).padEnd(58)}│
├────────────────────────────────────────────────────────────────────────┤
${text.trim().split('\n').map(line => `│ ${line.substring(0, 70).padEnd(70)} │`).join('\n')}
└────────────────────────────────────────────────────────────────────────┘
`);
}
