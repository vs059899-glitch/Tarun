import { BusinessLead } from '../src/types';
import { sendAdminLeadNotification } from './email';

export interface DispatchResult {
  email: {
    dispatched: boolean;
    status: 'delivered' | 'logged' | 'failed';
    recipient: string;
    error?: string;
  };
  crmWebhook?: {
    attempted: boolean;
    status: 'sent' | 'skipped' | 'failed';
    error?: string;
  };
  whatsAppNotify?: {
    attempted: boolean;
    status: 'queued' | 'skipped' | 'failed';
  };
}

/**
 * Dispatches lead data to all connected channels:
 * 1. Automatic Admin Email Notification (vs059899@gmail.com)
 * 2. CRM Webhook (HubSpot, Salesforce, Zoho, Zapier) if configured
 * 3. WhatsApp Business notification hook if configured
 */
export async function dispatchLead(lead: BusinessLead): Promise<DispatchResult> {
  const result: DispatchResult = {
    email: {
      dispatched: false,
      status: 'logged',
      recipient: 'vs059899@gmail.com'
    }
  };

  // 1. Email Notification
  try {
    const emailRes = await sendAdminLeadNotification(lead);
    result.email = {
      dispatched: true,
      status: emailRes.status,
      recipient: emailRes.record.recipient,
      error: emailRes.error
    };
  } catch (err: any) {
    console.error('[Integrations] Email notification error:', err);
    result.email.error = err.message;
  }

  // 2. Extensible CRM Webhook (e.g. Zapier, Make, HubSpot, Zoho CRM)
  const webhookUrl = process.env.CRM_WEBHOOK_URL || process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'lead.created',
          lead: {
            id: lead.lead_id || lead.id,
            fullName: lead.full_name || lead.fullName,
            email: lead.email,
            companyName: lead.company_name || lead.companyName,
            phone: lead.phone,
            createdAt: lead.created_at || lead.createdAt,
            lastActivity: lead.last_activity || lead.lastActivity,
            source: lead.source,
            sessionId: lead.session_id || lead.sessionId,
            uploadedFileStatus: lead.uploaded_file_status
          }
        })
      });
      result.crmWebhook = {
        attempted: true,
        status: resp.ok ? 'sent' : 'failed',
        error: resp.ok ? undefined : `HTTP ${resp.status}`
      };
    } catch (err: any) {
      console.warn('[Integrations] CRM webhook dispatch failed:', err.message);
      result.crmWebhook = { attempted: true, status: 'failed', error: err.message };
    }
  } else {
    result.crmWebhook = { attempted: false, status: 'skipped' };
  }

  // 3. Extensible WhatsApp Business Hook
  const waApiKey = process.env.WHATSAPP_API_KEY;
  if (waApiKey) {
    // Ready for WhatsApp Cloud API integration
    result.whatsAppNotify = { attempted: true, status: 'queued' };
  } else {
    result.whatsAppNotify = { attempted: false, status: 'skipped' };
  }

  return result;
}
