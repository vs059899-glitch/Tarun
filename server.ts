import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { processChatMessage } from './server/gemini';
import { dispatchLead } from './server/integrations';
import { sendAdminLeadNotification } from './server/email';
import { AnalyticsEvent, BusinessLead, ChatSession } from './src/types';

// RFC-compliant email validation on backend (Requirement 3)
function isValidEmail(email: unknown): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed) && trimmed.length <= 254;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple token storage for admin session
  const validAdminTokens = new Set<string>();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized admin access' });
    }
    const token = authHeader.split(' ')[1];
    if (!validAdminTokens.has(token)) {
      return res.status(401).json({ error: 'Session expired or invalid token' });
    }
    next();
  };

  // 1. HEALTH CHECK
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Resa AI Assistant API' });
  });

  // 2. ADMIN AUTH
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      validAdminTokens.add(token);
      return res.json({ success: true, token });
    }
    return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
  });

  app.post('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (validAdminTokens.has(token)) {
        return res.json({ valid: true });
      }
    }
    res.json({ valid: false });
  });

  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      validAdminTokens.delete(authHeader.split(' ')[1]);
    }
    res.json({ success: true });
  });

  // 3. CHAT API
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, sessionId, userMode } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ error: 'Missing message or sessionId' });
      }

      // Process with rules engine and Gemini AI
      const result = await processChatMessage({
        message,
        history: history || [],
        sessionId,
        userMode
      });

      // Update session message count
      const session = db.getSessionById(sessionId);
      if (session) {
        db.updateSession(sessionId, {
          messageCount: session.messageCount + 1,
          userMode: result.detectedMode || session.userMode,
          primaryConcern: result.detectedConcern || session.primaryConcern,
          recommendationGiven: result.recommendation ? result.recommendation.brandName : session.recommendationGiven
        });
      }

      res.json(result);
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // 4. ANALYTICS EVENTS API
  app.post('/api/analytics/events', (req, res) => {
    try {
      const event: AnalyticsEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sessionId: req.body.sessionId,
        eventType: req.body.eventType,
        category: req.body.category,
        concern: req.body.concern,
        brandRecommended: req.body.brandRecommended,
        metadata: req.body.metadata,
        timestamp: new Date().toISOString()
      };

      db.addEvent(event);

      // Also update session context if applicable
      const session = db.getSessionById(event.sessionId);
      if (session) {
        const updates: Partial<ChatSession> = {};
        if (event.concern) updates.primaryConcern = event.concern;
        if (event.brandRecommended) updates.recommendationGiven = event.brandRecommended;
        if (event.eventType === 'ENQUIRY_STARTED') updates.enquiryStarted = true;
        if (event.eventType === 'ENQUIRY_SUBMITTED') updates.enquirySubmitted = true;
        if (event.eventType === 'WHATSAPP_CLICKED') updates.contactActionTaken = 'WhatsApp';
        if (event.eventType === 'CALL_CLICKED') updates.contactActionTaken = 'Call';
        if (event.eventType === 'CONTACT_CLICKED') updates.contactActionTaken = 'Contact Us';
        if (Object.keys(updates).length > 0) {
          db.updateSession(event.sessionId, updates);
        }
      }

      res.json({ success: true, event });
    } catch (err) {
      console.error('Error recording event:', err);
      res.status(500).json({ error: 'Failed to record event' });
    }
  });

  // 5. SESSION MANAGEMENT
  app.post('/api/analytics/sessions', (req, res) => {
    try {
      const { id, deviceType, userMode } = req.body;
      const session: ChatSession = {
        id: id || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        startTime: new Date().toISOString(),
        deviceType: deviceType || 'Desktop',
        userMode: userMode || 'general',
        messageCount: 0,
        durationSeconds: 0,
        status: 'active',
        enquiryStarted: false,
        enquirySubmitted: false
      };

      db.addSession(session);
      res.json({ success: true, session });
    } catch (err) {
      console.error('Error creating session:', err);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  app.patch('/api/analytics/sessions/:id', (req, res) => {
    try {
      const updated = db.updateSession(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json({ success: true, session: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update session' });
    }
  });

  app.get('/api/analytics/sessions', authMiddleware, (req, res) => {
    res.json(db.getSessions());
  });

  // 6. METRICS & INSIGHTS (Protected Admin Endpoint)
  app.get('/api/analytics/metrics', authMiddleware, (req, res) => {
    try {
      const range = (req.query.range as string) || '30days';
      const customStart = req.query.start as string | undefined;
      const customEnd = req.query.end as string | undefined;
      const metrics = db.getMetrics(range, customStart, customEnd);
      res.json(metrics);
    } catch (err) {
      console.error('Metrics calculation error:', err);
      res.status(500).json({ error: 'Failed to compute metrics' });
    }
  });

  // 7. LEADS API
  // Professional lead capture endpoint for new users and consultation flow (Requirements 1-7)
  app.post('/api/leads/capture', async (req, res) => {
    try {
      const {
        fullName,
        email,
        companyName,
        phone,
        source,
        sessionId,
        uploadedFileStatus,
        productCategory,
        requirement,
        estimatedQuantity
      } = req.body;

      // Backend email validation (Requirements 3 & 11)
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.'
        });
      }

      // Add or update lead to prevent duplicates for the same email address (Requirement 6)
      const { lead, isNew } = db.addOrUpdateLead({
        fullName: fullName || 'Valued Visitor',
        email,
        companyName: companyName || '',
        phone: phone || '',
        source: source || 'Chatbot Consultation',
        sessionId,
        uploadedFileStatus: uploadedFileStatus || 'No File Uploaded',
        productCategory: productCategory || 'General Cosmetics',
        requirement: requirement || 'Consultation / Lead Capture',
        estimatedQuantity
      });

      // Record structured analytics event
      db.addEvent({
        id: `ev_${Date.now()}_lead_cap`,
        sessionId: sessionId || lead.lead_id,
        eventType: 'ENQUIRY_SUBMITTED',
        category: 'Business',
        timestamp: new Date().toISOString()
      });

      if (sessionId) {
        db.updateSession(sessionId, {
          enquirySubmitted: true,
          leadId: lead.lead_id,
          leadEmail: lead.email,
          leadName: lead.full_name
        });
      }

      // Send automatic notification email to vs059899@gmail.com (Requirement 7 & 8)
      // and dispatch to extensible CRM/integrations (Requirement 15)
      let dispatchInfo = null;
      if (isNew) {
        try {
          const emailSend = await sendAdminLeadNotification(lead);
          db.addNotification(emailSend.record);
          dispatchInfo = await dispatchLead(lead);
        } catch (notifErr) {
          console.error('Notification dispatch error:', notifErr);
        }
      }

      return res.json({
        success: true,
        message: 'Thanks! Your details have been saved.',
        lead,
        isNew,
        dispatchInfo
      });
    } catch (err: any) {
      console.error('Lead capture error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to save lead information.'
      });
    }
  });

  // Backward-compatible endpoint for business manufacturing inquiry
  app.post('/api/leads', async (req, res) => {
    try {
      const {
        fullName,
        companyName,
        phone,
        email,
        productCategory,
        requirement,
        estimatedQuantity,
        sessionId,
        uploadedFileStatus,
        source
      } = req.body;

      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.'
        });
      }

      const { lead, isNew } = db.addOrUpdateLead({
        fullName: fullName || 'Manufacturing Inquirer',
        companyName: companyName || '',
        phone: phone || '',
        email,
        productCategory: productCategory || 'General Cosmetics',
        requirement: requirement || 'General business enquiry',
        estimatedQuantity,
        sessionId,
        source: source || 'Business Manufacturing Enquiry',
        uploadedFileStatus: uploadedFileStatus || 'No File Uploaded'
      });

      // Record structured event
      db.addEvent({
        id: `ev_${Date.now()}_enq_sub`,
        sessionId: sessionId || lead.lead_id,
        eventType: 'ENQUIRY_SUBMITTED',
        category: 'Business',
        timestamp: new Date().toISOString()
      });

      if (sessionId) {
        db.updateSession(sessionId, {
          enquirySubmitted: true,
          leadId: lead.lead_id,
          leadEmail: lead.email,
          leadName: lead.full_name
        });
      }

      // Send automatic notification email to vs059899@gmail.com
      if (isNew) {
        try {
          const emailSend = await sendAdminLeadNotification(lead);
          db.addNotification(emailSend.record);
          await dispatchLead(lead);
        } catch (notifErr) {
          console.error('Notification dispatch error:', notifErr);
        }
      }

      res.json({
        success: true,
        message: 'Thanks! Your details have been saved.',
        lead,
        isNew
      });
    } catch (err) {
      console.error('Lead submission error:', err);
      res.status(500).json({ success: false, error: 'Failed to submit enquiry' });
    }
  });

  // Protected leads table
  app.get('/api/leads', authMiddleware, (req, res) => {
    res.json(db.getLeads());
  });

  // Protected lead details endpoint (Requirement 9)
  app.get('/api/admin/leads/:id', authMiddleware, (req, res) => {
    const details = db.getLeadDetails(req.params.id);
    if (!details) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ success: true, ...details });
  });

  // Protected notifications audit endpoint
  app.get('/api/admin/notifications', authMiddleware, (req, res) => {
    res.json(db.getNotifications());
  });

  app.patch('/api/leads/:id/status', authMiddleware, (req, res) => {
    const { status } = req.body;
    const updated = db.updateLeadStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ success: true, lead: updated });
  });

  // 8. DEMO DATA GENERATION & CLEARING (Admin only)
  app.post('/api/admin/demo-data/generate', authMiddleware, (req, res) => {
    const result = db.generateDemoData();
    res.json({ success: true, ...result });
  });

  app.post('/api/admin/demo-data/clear', authMiddleware, (req, res) => {
    const result = db.clearDemoData();
    res.json({ success: true, ...result });
  });

  // 9. CSV EXPORTS (Admin only)
  app.get('/api/admin/export/:type', authMiddleware, (req, res) => {
    const type = req.params.type as 'events' | 'leads' | 'sessions';
    if (!['events', 'leads', 'sessions'].includes(type)) {
      return res.status(400).send('Invalid export type');
    }
    const csvData = db.exportCsv(type);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=resa_${type}_export_${Date.now()}.csv`);
    res.send(csvData);
  });

  // Process exception guards to prevent crash on Hostinger Passenger
  process.on('uncaughtException', (err) => {
    console.error('[ResaServer] Uncaught Exception:', err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[ResaServer] Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
