import fs from 'fs';
import path from 'path';
import {
  AnalyticsEvent,
  BusinessLead,
  ChatSession,
  LeadNotificationRecord,
  LeadStatus,
  UserMode
} from '../src/types';

interface StoreSchema {
  sessions: ChatSession[];
  events: AnalyticsEvent[];
  leads: BusinessLead[];
  notifications: LeadNotificationRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'resa_store.json');

class ResaDatabase {
  private store: StoreSchema = {
    sessions: [],
    events: [],
    leads: [],
    notifications: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.store = {
          sessions: parsed.sessions || [],
          events: parsed.events || [],
          leads: (parsed.leads || []).map((l: any) => this.normalizeLead(l)),
          notifications: parsed.notifications || []
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error initializing ResaDatabase:', err);
    }
  }

  private normalizeLead(l: any): BusinessLead {
    const leadId = l.lead_id || l.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullName = l.full_name || l.fullName || 'Anonymous Contact';
    const companyName = l.company_name || l.companyName || 'Not specified';
    const createdAt = l.created_at || l.createdAt || new Date().toISOString();
    const lastActivity = l.last_activity || l.lastActivity || createdAt;
    const sessionId = l.session_id || l.sessionId || '';
    const uploadedFileStatus = l.uploaded_file_status || 'No File Uploaded';
    const source = l.source || 'Chatbot Consultation';

    return {
      lead_id: leadId,
      id: leadId,
      full_name: fullName,
      fullName: fullName,
      email: l.email || '',
      company_name: companyName,
      companyName: companyName,
      phone: l.phone || 'Not provided',
      created_at: createdAt,
      createdAt: createdAt,
      last_activity: lastActivity,
      lastActivity: lastActivity,
      source,
      session_id: sessionId,
      sessionId: sessionId,
      uploaded_file_status: uploadedFileStatus,
      productCategory: l.productCategory || 'General Cosmetics',
      requirement: l.requirement || 'General consultation',
      estimatedQuantity: l.estimatedQuantity,
      status: l.status || 'New',
      isDemo: l.isDemo
    };
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving ResaDatabase:', err);
    }
  }

  // SESSIONS
  public getSessions(limit = 200): ChatSession[] {
    return [...this.store.sessions].reverse().slice(0, limit);
  }

  public getSessionById(id: string): ChatSession | undefined {
    return this.store.sessions.find(s => s.id === id);
  }

  public addSession(session: ChatSession): ChatSession {
    const existingIndex = this.store.sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      this.store.sessions[existingIndex] = session;
    } else {
      this.store.sessions.push(session);
    }
    this.save();
    return session;
  }

  public updateSession(id: string, updates: Partial<ChatSession>): ChatSession | null {
    const session = this.store.sessions.find(s => s.id === id);
    if (!session) return null;
    Object.assign(session, updates);
    this.save();
    return session;
  }

  // EVENTS
  public addEvent(event: AnalyticsEvent): AnalyticsEvent {
    this.store.events.push(event);
    this.save();
    return event;
  }

  public getEvents(limit = 1000): AnalyticsEvent[] {
    return [...this.store.events].reverse().slice(0, limit);
  }

  // LEADS
  public addLead(lead: BusinessLead): BusinessLead {
    const normalized = this.normalizeLead(lead);
    this.store.leads.push(normalized);
    this.save();
    return normalized;
  }

  /**
   * Add or update lead to prevent duplicate leads by email (Requirement 6)
   */
  public addOrUpdateLead(payload: {
    fullName: string;
    email: string;
    companyName?: string;
    phone?: string;
    source?: string;
    sessionId?: string;
    uploadedFileStatus?: string;
    requirement?: string;
    productCategory?: string;
    estimatedQuantity?: string;
  }): { lead: BusinessLead; isNew: boolean } {
    const normalizedEmail = (payload.email || '').trim().toLowerCase();
    const now = new Date().toISOString();

    const existingLead = this.store.leads.find(
      l => (l.email || '').trim().toLowerCase() === normalizedEmail
    );

    if (existingLead) {
      // Update existing lead activity and information
      existingLead.last_activity = now;
      existingLead.lastActivity = now;

      if (payload.fullName && payload.fullName.trim()) {
        existingLead.full_name = payload.fullName.trim();
        existingLead.fullName = payload.fullName.trim();
      }
      if (payload.companyName && payload.companyName.trim()) {
        existingLead.company_name = payload.companyName.trim();
        existingLead.companyName = payload.companyName.trim();
      }
      if (payload.phone && payload.phone.trim()) {
        existingLead.phone = payload.phone.trim();
      }
      if (payload.sessionId) {
        existingLead.session_id = payload.sessionId;
        existingLead.sessionId = payload.sessionId;
        // Associate session with lead
        this.updateSession(payload.sessionId, {
          leadId: existingLead.lead_id,
          leadEmail: existingLead.email,
          leadName: existingLead.full_name,
          enquirySubmitted: true
        });
      }
      if (payload.uploadedFileStatus && payload.uploadedFileStatus !== 'No File Uploaded') {
        existingLead.uploaded_file_status = payload.uploadedFileStatus;
      }
      if (payload.source) {
        existingLead.source = payload.source;
      }
      if (payload.requirement && payload.requirement.trim()) {
        existingLead.requirement = payload.requirement.trim();
      }
      if (payload.productCategory) {
        existingLead.productCategory = payload.productCategory;
      }
      if (payload.estimatedQuantity) {
        existingLead.estimatedQuantity = payload.estimatedQuantity;
      }

      this.save();
      return { lead: existingLead, isNew: false };
    }

    // Brand new lead
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullName = (payload.fullName || 'Anonymous Contact').trim();
    const companyName = (payload.companyName || 'Not specified').trim();
    const phone = (payload.phone || 'Not provided').trim();
    const sessionId = payload.sessionId || '';
    const uploadedFileStatus = payload.uploadedFileStatus || 'No File Uploaded';
    const source = payload.source || 'Chatbot Consultation';

    const newLead: BusinessLead = {
      lead_id: leadId,
      id: leadId,
      full_name: fullName,
      fullName: fullName,
      email: normalizedEmail,
      company_name: companyName,
      companyName: companyName,
      phone,
      created_at: now,
      createdAt: now,
      last_activity: now,
      lastActivity: now,
      source,
      session_id: sessionId,
      sessionId,
      uploaded_file_status: uploadedFileStatus,
      productCategory: payload.productCategory || 'General Cosmetics',
      requirement: payload.requirement || 'General consultation',
      estimatedQuantity: payload.estimatedQuantity,
      status: 'New'
    };

    this.store.leads.push(newLead);

    // Associate session
    if (sessionId) {
      this.updateSession(sessionId, {
        leadId,
        leadEmail: normalizedEmail,
        leadName: fullName,
        enquirySubmitted: true
      });
    }

    this.save();
    return { lead: newLead, isNew: true };
  }

  public getLeads(): BusinessLead[] {
    return [...this.store.leads].reverse();
  }

  public getLeadById(id: string): BusinessLead | undefined {
    return this.store.leads.find(l => l.lead_id === id || l.id === id);
  }

  public getLeadDetails(id: string) {
    const lead = this.getLeadById(id);
    if (!lead) return null;

    const session = lead.session_id ? this.getSessionById(lead.session_id) : undefined;
    const sessionEvents = lead.session_id
      ? this.store.events.filter(e => e.sessionId === lead.session_id)
      : [];
    const notifications = this.store.notifications.filter(n => n.leadId === lead.lead_id || n.leadId === lead.id);

    return {
      lead,
      session,
      events: sessionEvents,
      notifications
    };
  }

  public updateLeadStatus(id: string, status: LeadStatus): BusinessLead | null {
    const lead = this.store.leads.find(l => l.lead_id === id || l.id === id);
    if (!lead) return null;
    lead.status = status;
    lead.last_activity = new Date().toISOString();
    lead.lastActivity = lead.last_activity;
    this.save();
    return lead;
  }

  // NOTIFICATIONS AUDIT
  public addNotification(notification: LeadNotificationRecord): void {
    this.store.notifications.push(notification);
    this.save();
  }

  public getNotifications(limit = 100): LeadNotificationRecord[] {
    return [...this.store.notifications].reverse().slice(0, limit);
  }

  // DEMO DATA GENERATOR & STATUS
  public hasDemoData(): boolean {
    return (
      this.store.sessions.some(s => s.isDemo) ||
      this.store.events.some(e => e.isDemo) ||
      this.store.leads.some(l => l.isDemo)
    );
  }

  public clearDemoData(): { sessionsRemoved: number; eventsRemoved: number; leadsRemoved: number } {
    const initialSessions = this.store.sessions.length;
    const initialEvents = this.store.events.length;
    const initialLeads = this.store.leads.length;

    this.store.sessions = this.store.sessions.filter(s => !s.isDemo);
    this.store.events = this.store.events.filter(e => !e.isDemo);
    this.store.leads = this.store.leads.filter(l => !l.isDemo);

    this.save();

    return {
      sessionsRemoved: initialSessions - this.store.sessions.length,
      eventsRemoved: initialEvents - this.store.events.length,
      leadsRemoved: initialLeads - this.store.leads.length
    };
  }

  public generateDemoData(): { sessionsCreated: number; leadsCreated: number } {
    // Clean old demo data first
    this.clearDemoData();

    const now = new Date();
    const demoSessions: ChatSession[] = [];
    const demoEvents: AnalyticsEvent[] = [];
    const demoLeads: BusinessLead[] = [];

    const concerns = [
      { key: 'ROUGH_HAIR_SELECTED', name: 'Rough Hair', category: 'Haircare', brand: 'Keragraphy' },
      { key: 'SMOOTHNESS_SHINE_SELECTED', name: 'Smoothness & Shine', category: 'Haircare', brand: 'Calveo Professional' },
      { key: 'DULL_HAIR_SELECTED', name: 'Dull Hair', category: 'Haircare', brand: 'Calveo Professional' },
      { key: 'FRIZZ_SELECTED', name: 'Frizz / Manageability', category: 'Haircare', brand: 'Calveo Professional' },
      { key: 'DULL_LOOKING_SKIN_SELECTED', name: 'Dull-Looking Skin', category: 'Facial Care', brand: 'PH Professional' },
      { key: 'FACIAL_CARE_SELECTED', name: 'Facial Care', category: 'Facial Care', brand: 'PH Professional' }
    ];

    const leadCategories = ['Haircare', 'Skincare', 'Facial Care', 'Shampoo', 'Body Care'];
    const leadNames = [
      { name: 'Aarav Mehta', company: 'Luxe Botanics', req: 'Looking for contract manufacturing for sulphate-free keratin shampoo line.' },
      { name: 'Pooja Sharma', company: 'GlowSkin Labs', req: 'Private label brightening facial serum and night cream.' },
      { name: 'Vikram Sengupta', company: 'Sengupta Wellness', req: 'Developing luxury hair salon range for 20 boutique salons.' },
      { name: 'Ananya Rao', company: 'PureOrigins', req: 'Custom formulation for scalp revitalizer and anti-frizz serum.' },
      { name: 'Rohan Verma', company: 'Verma Cosmeceuticals', req: 'Contract manufacturing partner for 5000 units batch run.' }
    ];

    // Generate 38 simulated sessions distributed over past 28 days
    for (let i = 0; i < 38; i++) {
      const daysAgo = Math.floor(Math.random() * 28);
      const sessionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000);
      const iso = sessionDate.toISOString();
      const sessionId = `demo_sess_${Date.now()}_${i}`;
      const isBusiness = i % 3 === 0;
      const device: 'Desktop' | 'Mobile' | 'Tablet' = i % 2 === 0 ? 'Mobile' : (i % 5 === 0 ? 'Tablet' : 'Desktop');

      if (isBusiness) {
        const isEnquiryStarted = i % 2 === 0;
        const isEnquirySubmitted = isEnquiryStarted && i % 4 === 0;
        const contactAction = i % 5 === 0 ? 'WhatsApp' : (i % 7 === 0 ? 'Call' : undefined);

        const session: ChatSession = {
          id: sessionId,
          startTime: iso,
          endTime: new Date(sessionDate.getTime() + 180000).toISOString(),
          deviceType: device,
          userMode: 'business',
          messageCount: Math.floor(Math.random() * 6) + 4,
          durationSeconds: Math.floor(Math.random() * 240) + 60,
          status: 'completed',
          enquiryStarted: isEnquiryStarted,
          enquirySubmitted: isEnquirySubmitted,
          contactActionTaken: contactAction as any,
          isDemo: true
        };
        demoSessions.push(session);

        demoEvents.push({
          id: `demo_ev_${sessionId}_start`,
          sessionId,
          eventType: 'BUSINESS_MODE_SELECTED',
          category: 'Business',
          timestamp: iso,
          isDemo: true
        });

        if (isEnquiryStarted) {
          demoEvents.push({
            id: `demo_ev_${sessionId}_enq_start`,
            sessionId,
            eventType: 'ENQUIRY_STARTED',
            category: 'Business',
            timestamp: new Date(sessionDate.getTime() + 60000).toISOString(),
            isDemo: true
          });
        }

        if (isEnquirySubmitted) {
          demoEvents.push({
            id: `demo_ev_${sessionId}_enq_sub`,
            sessionId,
            eventType: 'ENQUIRY_SUBMITTED',
            category: 'Business',
            timestamp: new Date(sessionDate.getTime() + 120000).toISOString(),
            isDemo: true
          });
        }

        if (contactAction === 'WhatsApp') {
          demoEvents.push({
            id: `demo_ev_${sessionId}_wa`,
            sessionId,
            eventType: 'WHATSAPP_CLICKED',
            category: 'Business',
            timestamp: new Date(sessionDate.getTime() + 90000).toISOString(),
            isDemo: true
          });
        } else if (contactAction === 'Call') {
          demoEvents.push({
            id: `demo_ev_${sessionId}_call`,
            sessionId,
            eventType: 'CALL_CLICKED',
            category: 'Business',
            timestamp: new Date(sessionDate.getTime() + 90000).toISOString(),
            isDemo: true
          });
        }
      } else {
        // Consumer session
        const concernChoice = concerns[i % concerns.length];
        const recShown = true;
        const recClicked = i % 2 === 0;
        const contactAction = i % 6 === 0 ? 'WhatsApp' : undefined;

        const session: ChatSession = {
          id: sessionId,
          startTime: iso,
          endTime: new Date(sessionDate.getTime() + 150000).toISOString(),
          deviceType: device,
          userMode: 'consumer',
          messageCount: Math.floor(Math.random() * 5) + 3,
          durationSeconds: Math.floor(Math.random() * 180) + 45,
          status: 'completed',
          primaryConcern: concernChoice.name,
          recommendationGiven: concernChoice.brand,
          enquiryStarted: false,
          enquirySubmitted: false,
          contactActionTaken: contactAction as any,
          isDemo: true
        };
        demoSessions.push(session);

        demoEvents.push({
          id: `demo_ev_${sessionId}_mode`,
          sessionId,
          eventType: 'CONSUMER_MODE_SELECTED',
          category: concernChoice.category as any,
          timestamp: iso,
          isDemo: true
        });

        demoEvents.push({
          id: `demo_ev_${sessionId}_concern`,
          sessionId,
          eventType: concernChoice.key as any,
          category: concernChoice.category as any,
          concern: concernChoice.name,
          timestamp: new Date(sessionDate.getTime() + 45000).toISOString(),
          isDemo: true
        });

        demoEvents.push({
          id: `demo_ev_${sessionId}_rec_shown`,
          sessionId,
          eventType: 'RECOMMENDATION_SHOWN',
          category: concernChoice.category as any,
          brandRecommended: concernChoice.brand,
          timestamp: new Date(sessionDate.getTime() + 80000).toISOString(),
          isDemo: true
        });

        if (recClicked) {
          demoEvents.push({
            id: `demo_ev_${sessionId}_rec_click`,
            sessionId,
            eventType: 'RECOMMENDATION_CLICKED',
            category: concernChoice.category as any,
            brandRecommended: concernChoice.brand,
            timestamp: new Date(sessionDate.getTime() + 110000).toISOString(),
            isDemo: true
          });
        }
      }
    }

    // Generate 5 sample business leads
    leadNames.forEach((item, idx) => {
      const daysAgo = idx * 5 + 1;
      const leadDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Closed'];
      const leadId = `demo_lead_${idx + 1}`;
      const sessId = `demo_sess_lead_${idx + 1}`;
      demoLeads.push(
        this.normalizeLead({
          lead_id: leadId,
          id: leadId,
          session_id: sessId,
          sessionId: sessId,
          full_name: item.name,
          fullName: item.name,
          company_name: item.company,
          companyName: item.company,
          phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
          email: `${item.name.toLowerCase().replace(' ', '.')}@example.com`,
          productCategory: leadCategories[idx % leadCategories.length],
          requirement: item.req,
          estimatedQuantity: `${(idx + 2) * 1000} units`,
          status: statuses[idx % statuses.length],
          created_at: leadDate.toISOString(),
          createdAt: leadDate.toISOString(),
          last_activity: new Date(leadDate.getTime() + 3600000).toISOString(),
          lastActivity: new Date(leadDate.getTime() + 3600000).toISOString(),
          source: idx % 2 === 0 ? 'Chatbot Post-Consultation' : 'Manufacturing Lead Form',
          uploaded_file_status: idx === 1 ? 'Uploaded: brand_brief.pdf' : 'No File Uploaded',
          isDemo: true
        })
      );
    });

    this.store.sessions.push(...demoSessions);
    this.store.events.push(...demoEvents);
    this.store.leads.push(...demoLeads);
    this.save();

    return {
      sessionsCreated: demoSessions.length,
      leadsCreated: demoLeads.length
    };
  }

  // METRICS COMPUTATION (with Date filtering)
  public getMetrics(dateRange: string = '30days', customStart?: string, customEnd?: string) {
    const now = new Date();
    let startDate: Date;

    if (dateRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === '7days') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '30days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'custom' && customStart) {
      startDate = new Date(customStart);
    } else {
      // all time
      startDate = new Date(0);
    }

    const endDate = customEnd && dateRange === 'custom' ? new Date(customEnd) : now;

    // Filter sessions and events within range
    const filteredSessions = this.store.sessions.filter(s => {
      const d = new Date(s.startTime);
      return d >= startDate && d <= endDate;
    });

    const filteredEvents = this.store.events.filter(e => {
      const d = new Date(e.timestamp);
      return d >= startDate && d <= endDate;
    });

    const totalConversations = filteredSessions.length;
    const consumerSessions = filteredSessions.filter(s => s.userMode === 'consumer').length;
    const businessSessions = filteredSessions.filter(s => s.userMode === 'business').length;

    const recommendationsShown = filteredEvents.filter(e => e.eventType === 'RECOMMENDATION_SHOWN').length;
    const recommendationsClicked = filteredEvents.filter(e => e.eventType === 'RECOMMENDATION_CLICKED').length;

    const enquiriesStarted = filteredEvents.filter(e => e.eventType === 'ENQUIRY_STARTED').length;
    const enquiriesSubmitted = filteredEvents.filter(e => e.eventType === 'ENQUIRY_SUBMITTED').length;

    const whatsappClicks = filteredEvents.filter(e => e.eventType === 'WHATSAPP_CLICKED').length;
    const callClicks = filteredEvents.filter(e => e.eventType === 'CALL_CLICKED').length;
    const contactClicks = filteredEvents.filter(e => e.eventType === 'CONTACT_CLICKED').length;
    const totalContactActions = whatsappClicks + callClicks + contactClicks;

    // Conversion rates
    const recommendationConversionRate =
      recommendationsShown > 0
        ? Math.round((recommendationsClicked / recommendationsShown) * 1000) / 10
        : 0;

    const enquiryConversionRate =
      enquiriesStarted > 0
        ? Math.round((enquiriesSubmitted / enquiriesStarted) * 1000) / 10
        : 0;

    const contactConversionRate =
      totalConversations > 0
        ? Math.round((totalContactActions / totalConversations) * 1000) / 10
        : 0;

    // Brand recommendations counts
    const brandCounts: Record<string, number> = {
      Keragraphy: 0,
      'Calveo Professional': 0,
      'PH Professional': 0
    };
    filteredEvents.forEach(e => {
      if (e.eventType === 'RECOMMENDATION_SHOWN' && e.brandRecommended) {
        if (brandCounts[e.brandRecommended] !== undefined) {
          brandCounts[e.brandRecommended]++;
        } else {
          brandCounts[e.brandRecommended] = 1;
        }
      }
    });

    // Concerns counts
    const concernCounts: Record<string, number> = {};
    filteredEvents.forEach(e => {
      if (e.concern) {
        concernCounts[e.concern] = (concernCounts[e.concern] || 0) + 1;
      }
    });

    // Timeline breakdown
    const timelineMap: Record<string, { date: string; consumer: number; business: number; total: number }> = {};
    filteredSessions.forEach(s => {
      const dStr = s.startTime.split('T')[0];
      if (!timelineMap[dStr]) {
        timelineMap[dStr] = { date: dStr, consumer: 0, business: 0, total: 0 };
      }
      timelineMap[dStr].total++;
      if (s.userMode === 'business') {
        timelineMap[dStr].business++;
      } else {
        timelineMap[dStr].consumer++;
      }
    });

    const timeline = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));

    // Dynamic Key Insights
    const insights: string[] = [];
    if (totalConversations === 0) {
      insights.push('Not enough data to generate this insight yet.');
    } else {
      if (consumerSessions >= businessSessions) {
        insights.push(
          `Most sessions (${consumerSessions} of ${totalConversations}) are consumer beauty inquiries.`
        );
      } else {
        insights.push(
          `Business inquiries currently lead with ${businessSessions} sessions out of ${totalConversations}.`
        );
      }

      // Top concern
      const topConcernEntry = Object.entries(concernCounts).sort((a, b) => b[1] - a[1])[0];
      if (topConcernEntry) {
        insights.push(
          `"${topConcernEntry[0]}" is currently the most requested consumer concern (${topConcernEntry[1]} consultations).`
        );
      }

      // Top brand
      const topBrandEntry = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0];
      if (topBrandEntry && topBrandEntry[1] > 0) {
        insights.push(
          `${topBrandEntry[0]} received the highest number of configured recommendations (${topBrandEntry[1]} times).`
        );
      }

      if (enquiriesStarted > 0) {
        insights.push(
          `Business lead generation shows ${enquiriesSubmitted} submitted enquiries from ${enquiriesStarted} initiated forms (${enquiryConversionRate}% conversion rate).`
        );
      } else {
        insights.push('Business users frequently ask about private-label and contract manufacturing.');
      }
    }

    return {
      kpi: {
        totalConversations,
        consumerSessions,
        businessSessions,
        recommendationsShown,
        recommendationsClicked,
        enquiriesStarted,
        enquiriesSubmitted,
        totalContactActions,
        whatsappClicks,
        callClicks,
        contactClicks,
        recommendationConversionRate,
        enquiryConversionRate,
        contactConversionRate
      },
      charts: {
        timeline,
        concerns: Object.entries(concernCounts).map(([name, count]) => ({ name, count })),
        brands: Object.entries(brandCounts).map(([name, value]) => ({ name, value })),
        userModes: [
          { name: 'Consumer', value: consumerSessions },
          { name: 'Business', value: businessSessions }
        ],
        funnel: [
          { stage: 'Business Sessions', count: businessSessions },
          { stage: 'Enquiry Started', count: enquiriesStarted },
          { stage: 'Enquiry Submitted', count: enquiriesSubmitted }
        ],
        contactActions: [
          { name: 'WhatsApp', count: whatsappClicks },
          { name: 'Direct Call', count: callClicks },
          { name: 'Contact Form', count: contactClicks }
        ]
      },
      insights,
      isDemoDataActive: this.hasDemoData()
    };
  }

  // EXPORT TO CSV
  public exportCsv(type: 'events' | 'leads' | 'sessions'): string {
    if (type === 'events') {
      const headers = ['ID', 'Session ID', 'Event Type', 'Category', 'Concern', 'Brand Recommended', 'Timestamp', 'Is Demo'];
      const rows = this.store.events.map(e => [
        e.id,
        e.sessionId,
        e.eventType,
        e.category || '',
        `"${(e.concern || '').replace(/"/g, '""')}"`,
        `"${(e.brandRecommended || '').replace(/"/g, '""')}"`,
        e.timestamp,
        e.isDemo ? 'Yes' : 'No'
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (type === 'leads') {
      const headers = [
        'Lead ID',
        'Full Name',
        'Email Address',
        'Company Name',
        'Phone Number',
        'Created At',
        'Last Activity',
        'Source',
        'Session ID',
        'Uploaded File Status',
        'Status',
        'Product Category',
        'Requirement',
        'Estimated Quantity',
        'Is Demo'
      ];
      const rows = this.store.leads.map(l => [
        l.lead_id || l.id,
        `"${(l.full_name || l.fullName || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.company_name || l.companyName || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        l.created_at || l.createdAt,
        l.last_activity || l.lastActivity || l.created_at || l.createdAt,
        `"${(l.source || '').replace(/"/g, '""')}"`,
        l.session_id || l.sessionId || '',
        `"${(l.uploaded_file_status || 'No File Uploaded').replace(/"/g, '""')}"`,
        l.status,
        `"${(l.productCategory || '').replace(/"/g, '""')}"`,
        `"${(l.requirement || '').replace(/"/g, '""')}"`,
        `"${(l.estimatedQuantity || '').replace(/"/g, '""')}"`,
        l.isDemo ? 'Yes' : 'No'
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    // Sessions
    const headers = ['Session ID', 'Start Time', 'Device Type', 'User Mode', 'Messages', 'Duration (s)', 'Primary Concern', 'Recommendation', 'Enquiry Started', 'Enquiry Submitted', 'Status', 'Is Demo'];
    const rows = this.store.sessions.map(s => [
      s.id,
      s.startTime,
      s.deviceType,
      s.userMode,
      s.messageCount,
      s.durationSeconds,
      `"${(s.primaryConcern || '').replace(/"/g, '""')}"`,
      `"${(s.recommendationGiven || '').replace(/"/g, '""')}"`,
      s.enquiryStarted ? 'Yes' : 'No',
      s.enquirySubmitted ? 'Yes' : 'No',
      s.status,
      s.isDemo ? 'Yes' : 'No'
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const db = new ResaDatabase();
