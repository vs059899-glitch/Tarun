var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DATA_FILE = import_path.default.join(DATA_DIR, "resa_store.json");
var ResaDatabase = class {
  constructor() {
    this.store = {
      sessions: [],
      events: [],
      leads: [],
      notifications: []
    };
    this.init();
  }
  init() {
    try {
      if (!import_fs.default.existsSync(DATA_DIR)) {
        import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (import_fs.default.existsSync(DATA_FILE)) {
        const raw = import_fs.default.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.store = {
          sessions: parsed.sessions || [],
          events: parsed.events || [],
          leads: (parsed.leads || []).map((l) => this.normalizeLead(l)),
          notifications: parsed.notifications || []
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error("Error initializing ResaDatabase:", err);
    }
  }
  normalizeLead(l) {
    const leadId = l.lead_id || l.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullName = l.full_name || l.fullName || "Anonymous Contact";
    const companyName = l.company_name || l.companyName || "Not specified";
    const createdAt = l.created_at || l.createdAt || (/* @__PURE__ */ new Date()).toISOString();
    const lastActivity = l.last_activity || l.lastActivity || createdAt;
    const sessionId = l.session_id || l.sessionId || "";
    const uploadedFileStatus = l.uploaded_file_status || "No File Uploaded";
    const source = l.source || "Chatbot Consultation";
    return {
      lead_id: leadId,
      id: leadId,
      full_name: fullName,
      fullName,
      email: l.email || "",
      company_name: companyName,
      companyName,
      phone: l.phone || "Not provided",
      created_at: createdAt,
      createdAt,
      last_activity: lastActivity,
      lastActivity,
      source,
      session_id: sessionId,
      sessionId,
      uploaded_file_status: uploadedFileStatus,
      productCategory: l.productCategory || "General Cosmetics",
      requirement: l.requirement || "General consultation",
      estimatedQuantity: l.estimatedQuantity,
      status: l.status || "New",
      isDemo: l.isDemo
    };
  }
  save() {
    try {
      import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(this.store, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving ResaDatabase:", err);
    }
  }
  // SESSIONS
  getSessions(limit = 200) {
    return [...this.store.sessions].reverse().slice(0, limit);
  }
  getSessionById(id) {
    return this.store.sessions.find((s) => s.id === id);
  }
  addSession(session) {
    const existingIndex = this.store.sessions.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      this.store.sessions[existingIndex] = session;
    } else {
      this.store.sessions.push(session);
    }
    this.save();
    return session;
  }
  updateSession(id, updates) {
    const session = this.store.sessions.find((s) => s.id === id);
    if (!session) return null;
    Object.assign(session, updates);
    this.save();
    return session;
  }
  // EVENTS
  addEvent(event) {
    this.store.events.push(event);
    this.save();
    return event;
  }
  getEvents(limit = 1e3) {
    return [...this.store.events].reverse().slice(0, limit);
  }
  // LEADS
  addLead(lead) {
    const normalized = this.normalizeLead(lead);
    this.store.leads.push(normalized);
    this.save();
    return normalized;
  }
  /**
   * Add or update lead to prevent duplicate leads by email (Requirement 6)
   */
  addOrUpdateLead(payload) {
    const normalizedEmail = (payload.email || "").trim().toLowerCase();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const existingLead = this.store.leads.find(
      (l) => (l.email || "").trim().toLowerCase() === normalizedEmail
    );
    if (existingLead) {
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
        this.updateSession(payload.sessionId, {
          leadId: existingLead.lead_id,
          leadEmail: existingLead.email,
          leadName: existingLead.full_name,
          enquirySubmitted: true
        });
      }
      if (payload.uploadedFileStatus && payload.uploadedFileStatus !== "No File Uploaded") {
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
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullName = (payload.fullName || "Anonymous Contact").trim();
    const companyName = (payload.companyName || "Not specified").trim();
    const phone = (payload.phone || "Not provided").trim();
    const sessionId = payload.sessionId || "";
    const uploadedFileStatus = payload.uploadedFileStatus || "No File Uploaded";
    const source = payload.source || "Chatbot Consultation";
    const newLead = {
      lead_id: leadId,
      id: leadId,
      full_name: fullName,
      fullName,
      email: normalizedEmail,
      company_name: companyName,
      companyName,
      phone,
      created_at: now,
      createdAt: now,
      last_activity: now,
      lastActivity: now,
      source,
      session_id: sessionId,
      sessionId,
      uploaded_file_status: uploadedFileStatus,
      productCategory: payload.productCategory || "General Cosmetics",
      requirement: payload.requirement || "General consultation",
      estimatedQuantity: payload.estimatedQuantity,
      status: "New"
    };
    this.store.leads.push(newLead);
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
  getLeads() {
    return [...this.store.leads].reverse();
  }
  getLeadById(id) {
    return this.store.leads.find((l) => l.lead_id === id || l.id === id);
  }
  getLeadDetails(id) {
    const lead = this.getLeadById(id);
    if (!lead) return null;
    const session = lead.session_id ? this.getSessionById(lead.session_id) : void 0;
    const sessionEvents = lead.session_id ? this.store.events.filter((e) => e.sessionId === lead.session_id) : [];
    const notifications = this.store.notifications.filter((n) => n.leadId === lead.lead_id || n.leadId === lead.id);
    return {
      lead,
      session,
      events: sessionEvents,
      notifications
    };
  }
  updateLeadStatus(id, status) {
    const lead = this.store.leads.find((l) => l.lead_id === id || l.id === id);
    if (!lead) return null;
    lead.status = status;
    lead.last_activity = (/* @__PURE__ */ new Date()).toISOString();
    lead.lastActivity = lead.last_activity;
    this.save();
    return lead;
  }
  // NOTIFICATIONS AUDIT
  addNotification(notification) {
    this.store.notifications.push(notification);
    this.save();
  }
  getNotifications(limit = 100) {
    return [...this.store.notifications].reverse().slice(0, limit);
  }
  // DEMO DATA GENERATOR & STATUS
  hasDemoData() {
    return this.store.sessions.some((s) => s.isDemo) || this.store.events.some((e) => e.isDemo) || this.store.leads.some((l) => l.isDemo);
  }
  clearDemoData() {
    const initialSessions = this.store.sessions.length;
    const initialEvents = this.store.events.length;
    const initialLeads = this.store.leads.length;
    this.store.sessions = this.store.sessions.filter((s) => !s.isDemo);
    this.store.events = this.store.events.filter((e) => !e.isDemo);
    this.store.leads = this.store.leads.filter((l) => !l.isDemo);
    this.save();
    return {
      sessionsRemoved: initialSessions - this.store.sessions.length,
      eventsRemoved: initialEvents - this.store.events.length,
      leadsRemoved: initialLeads - this.store.leads.length
    };
  }
  generateDemoData() {
    this.clearDemoData();
    const now = /* @__PURE__ */ new Date();
    const demoSessions = [];
    const demoEvents = [];
    const demoLeads = [];
    const concerns = [
      { key: "ROUGH_HAIR_SELECTED", name: "Rough Hair", category: "Haircare", brand: "Keragraphy" },
      { key: "SMOOTHNESS_SHINE_SELECTED", name: "Smoothness & Shine", category: "Haircare", brand: "Calveo Professional" },
      { key: "DULL_HAIR_SELECTED", name: "Dull Hair", category: "Haircare", brand: "Calveo Professional" },
      { key: "FRIZZ_SELECTED", name: "Frizz / Manageability", category: "Haircare", brand: "Calveo Professional" },
      { key: "DULL_LOOKING_SKIN_SELECTED", name: "Dull-Looking Skin", category: "Facial Care", brand: "PH Professional" },
      { key: "FACIAL_CARE_SELECTED", name: "Facial Care", category: "Facial Care", brand: "PH Professional" }
    ];
    const leadCategories = ["Haircare", "Skincare", "Facial Care", "Shampoo", "Body Care"];
    const leadNames = [
      { name: "Aarav Mehta", company: "Luxe Botanics", req: "Looking for contract manufacturing for sulphate-free keratin shampoo line." },
      { name: "Pooja Sharma", company: "GlowSkin Labs", req: "Private label brightening facial serum and night cream." },
      { name: "Vikram Sengupta", company: "Sengupta Wellness", req: "Developing luxury hair salon range for 20 boutique salons." },
      { name: "Ananya Rao", company: "PureOrigins", req: "Custom formulation for scalp revitalizer and anti-frizz serum." },
      { name: "Rohan Verma", company: "Verma Cosmeceuticals", req: "Contract manufacturing partner for 5000 units batch run." }
    ];
    for (let i = 0; i < 38; i++) {
      const daysAgo = Math.floor(Math.random() * 28);
      const sessionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1e3 - Math.random() * 12 * 60 * 60 * 1e3);
      const iso = sessionDate.toISOString();
      const sessionId = `demo_sess_${Date.now()}_${i}`;
      const isBusiness = i % 3 === 0;
      const device = i % 2 === 0 ? "Mobile" : i % 5 === 0 ? "Tablet" : "Desktop";
      if (isBusiness) {
        const isEnquiryStarted = i % 2 === 0;
        const isEnquirySubmitted = isEnquiryStarted && i % 4 === 0;
        const contactAction = i % 5 === 0 ? "WhatsApp" : i % 7 === 0 ? "Call" : void 0;
        const session = {
          id: sessionId,
          startTime: iso,
          endTime: new Date(sessionDate.getTime() + 18e4).toISOString(),
          deviceType: device,
          userMode: "business",
          messageCount: Math.floor(Math.random() * 6) + 4,
          durationSeconds: Math.floor(Math.random() * 240) + 60,
          status: "completed",
          enquiryStarted: isEnquiryStarted,
          enquirySubmitted: isEnquirySubmitted,
          contactActionTaken: contactAction,
          isDemo: true
        };
        demoSessions.push(session);
        demoEvents.push({
          id: `demo_ev_${sessionId}_start`,
          sessionId,
          eventType: "BUSINESS_MODE_SELECTED",
          category: "Business",
          timestamp: iso,
          isDemo: true
        });
        if (isEnquiryStarted) {
          demoEvents.push({
            id: `demo_ev_${sessionId}_enq_start`,
            sessionId,
            eventType: "ENQUIRY_STARTED",
            category: "Business",
            timestamp: new Date(sessionDate.getTime() + 6e4).toISOString(),
            isDemo: true
          });
        }
        if (isEnquirySubmitted) {
          demoEvents.push({
            id: `demo_ev_${sessionId}_enq_sub`,
            sessionId,
            eventType: "ENQUIRY_SUBMITTED",
            category: "Business",
            timestamp: new Date(sessionDate.getTime() + 12e4).toISOString(),
            isDemo: true
          });
        }
        if (contactAction === "WhatsApp") {
          demoEvents.push({
            id: `demo_ev_${sessionId}_wa`,
            sessionId,
            eventType: "WHATSAPP_CLICKED",
            category: "Business",
            timestamp: new Date(sessionDate.getTime() + 9e4).toISOString(),
            isDemo: true
          });
        } else if (contactAction === "Call") {
          demoEvents.push({
            id: `demo_ev_${sessionId}_call`,
            sessionId,
            eventType: "CALL_CLICKED",
            category: "Business",
            timestamp: new Date(sessionDate.getTime() + 9e4).toISOString(),
            isDemo: true
          });
        }
      } else {
        const concernChoice = concerns[i % concerns.length];
        const recShown = true;
        const recClicked = i % 2 === 0;
        const contactAction = i % 6 === 0 ? "WhatsApp" : void 0;
        const session = {
          id: sessionId,
          startTime: iso,
          endTime: new Date(sessionDate.getTime() + 15e4).toISOString(),
          deviceType: device,
          userMode: "consumer",
          messageCount: Math.floor(Math.random() * 5) + 3,
          durationSeconds: Math.floor(Math.random() * 180) + 45,
          status: "completed",
          primaryConcern: concernChoice.name,
          recommendationGiven: concernChoice.brand,
          enquiryStarted: false,
          enquirySubmitted: false,
          contactActionTaken: contactAction,
          isDemo: true
        };
        demoSessions.push(session);
        demoEvents.push({
          id: `demo_ev_${sessionId}_mode`,
          sessionId,
          eventType: "CONSUMER_MODE_SELECTED",
          category: concernChoice.category,
          timestamp: iso,
          isDemo: true
        });
        demoEvents.push({
          id: `demo_ev_${sessionId}_concern`,
          sessionId,
          eventType: concernChoice.key,
          category: concernChoice.category,
          concern: concernChoice.name,
          timestamp: new Date(sessionDate.getTime() + 45e3).toISOString(),
          isDemo: true
        });
        demoEvents.push({
          id: `demo_ev_${sessionId}_rec_shown`,
          sessionId,
          eventType: "RECOMMENDATION_SHOWN",
          category: concernChoice.category,
          brandRecommended: concernChoice.brand,
          timestamp: new Date(sessionDate.getTime() + 8e4).toISOString(),
          isDemo: true
        });
        if (recClicked) {
          demoEvents.push({
            id: `demo_ev_${sessionId}_rec_click`,
            sessionId,
            eventType: "RECOMMENDATION_CLICKED",
            category: concernChoice.category,
            brandRecommended: concernChoice.brand,
            timestamp: new Date(sessionDate.getTime() + 11e4).toISOString(),
            isDemo: true
          });
        }
      }
    }
    leadNames.forEach((item, idx) => {
      const daysAgo = idx * 5 + 1;
      const leadDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1e3);
      const statuses = ["New", "Contacted", "Qualified", "Closed"];
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
          phone: `+91 98${Math.floor(1e7 + Math.random() * 89999999)}`,
          email: `${item.name.toLowerCase().replace(" ", ".")}@example.com`,
          productCategory: leadCategories[idx % leadCategories.length],
          requirement: item.req,
          estimatedQuantity: `${(idx + 2) * 1e3} units`,
          status: statuses[idx % statuses.length],
          created_at: leadDate.toISOString(),
          createdAt: leadDate.toISOString(),
          last_activity: new Date(leadDate.getTime() + 36e5).toISOString(),
          lastActivity: new Date(leadDate.getTime() + 36e5).toISOString(),
          source: idx % 2 === 0 ? "Chatbot Post-Consultation" : "Manufacturing Lead Form",
          uploaded_file_status: idx === 1 ? "Uploaded: brand_brief.pdf" : "No File Uploaded",
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
  getMetrics(dateRange = "30days", customStart, customEnd) {
    const now = /* @__PURE__ */ new Date();
    let startDate;
    if (dateRange === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === "7days") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    } else if (dateRange === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
    } else if (dateRange === "custom" && customStart) {
      startDate = new Date(customStart);
    } else {
      startDate = /* @__PURE__ */ new Date(0);
    }
    const endDate = customEnd && dateRange === "custom" ? new Date(customEnd) : now;
    const filteredSessions = this.store.sessions.filter((s) => {
      const d = new Date(s.startTime);
      return d >= startDate && d <= endDate;
    });
    const filteredEvents = this.store.events.filter((e) => {
      const d = new Date(e.timestamp);
      return d >= startDate && d <= endDate;
    });
    const totalConversations = filteredSessions.length;
    const consumerSessions = filteredSessions.filter((s) => s.userMode === "consumer").length;
    const businessSessions = filteredSessions.filter((s) => s.userMode === "business").length;
    const recommendationsShown = filteredEvents.filter((e) => e.eventType === "RECOMMENDATION_SHOWN").length;
    const recommendationsClicked = filteredEvents.filter((e) => e.eventType === "RECOMMENDATION_CLICKED").length;
    const enquiriesStarted = filteredEvents.filter((e) => e.eventType === "ENQUIRY_STARTED").length;
    const enquiriesSubmitted = filteredEvents.filter((e) => e.eventType === "ENQUIRY_SUBMITTED").length;
    const whatsappClicks = filteredEvents.filter((e) => e.eventType === "WHATSAPP_CLICKED").length;
    const callClicks = filteredEvents.filter((e) => e.eventType === "CALL_CLICKED").length;
    const contactClicks = filteredEvents.filter((e) => e.eventType === "CONTACT_CLICKED").length;
    const totalContactActions = whatsappClicks + callClicks + contactClicks;
    const recommendationConversionRate = recommendationsShown > 0 ? Math.round(recommendationsClicked / recommendationsShown * 1e3) / 10 : 0;
    const enquiryConversionRate = enquiriesStarted > 0 ? Math.round(enquiriesSubmitted / enquiriesStarted * 1e3) / 10 : 0;
    const contactConversionRate = totalConversations > 0 ? Math.round(totalContactActions / totalConversations * 1e3) / 10 : 0;
    const brandCounts = {
      Keragraphy: 0,
      "Calveo Professional": 0,
      "PH Professional": 0
    };
    filteredEvents.forEach((e) => {
      if (e.eventType === "RECOMMENDATION_SHOWN" && e.brandRecommended) {
        if (brandCounts[e.brandRecommended] !== void 0) {
          brandCounts[e.brandRecommended]++;
        } else {
          brandCounts[e.brandRecommended] = 1;
        }
      }
    });
    const concernCounts = {};
    filteredEvents.forEach((e) => {
      if (e.concern) {
        concernCounts[e.concern] = (concernCounts[e.concern] || 0) + 1;
      }
    });
    const timelineMap = {};
    filteredSessions.forEach((s) => {
      const dStr = s.startTime.split("T")[0];
      if (!timelineMap[dStr]) {
        timelineMap[dStr] = { date: dStr, consumer: 0, business: 0, total: 0 };
      }
      timelineMap[dStr].total++;
      if (s.userMode === "business") {
        timelineMap[dStr].business++;
      } else {
        timelineMap[dStr].consumer++;
      }
    });
    const timeline = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));
    const insights = [];
    if (totalConversations === 0) {
      insights.push("Not enough data to generate this insight yet.");
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
      const topConcernEntry = Object.entries(concernCounts).sort((a, b) => b[1] - a[1])[0];
      if (topConcernEntry) {
        insights.push(
          `"${topConcernEntry[0]}" is currently the most requested consumer concern (${topConcernEntry[1]} consultations).`
        );
      }
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
        insights.push("Business users frequently ask about private-label and contract manufacturing.");
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
          { name: "Consumer", value: consumerSessions },
          { name: "Business", value: businessSessions }
        ],
        funnel: [
          { stage: "Business Sessions", count: businessSessions },
          { stage: "Enquiry Started", count: enquiriesStarted },
          { stage: "Enquiry Submitted", count: enquiriesSubmitted }
        ],
        contactActions: [
          { name: "WhatsApp", count: whatsappClicks },
          { name: "Direct Call", count: callClicks },
          { name: "Contact Form", count: contactClicks }
        ]
      },
      insights,
      isDemoDataActive: this.hasDemoData()
    };
  }
  // EXPORT TO CSV
  exportCsv(type) {
    if (type === "events") {
      const headers2 = ["ID", "Session ID", "Event Type", "Category", "Concern", "Brand Recommended", "Timestamp", "Is Demo"];
      const rows2 = this.store.events.map((e) => [
        e.id,
        e.sessionId,
        e.eventType,
        e.category || "",
        `"${(e.concern || "").replace(/"/g, '""')}"`,
        `"${(e.brandRecommended || "").replace(/"/g, '""')}"`,
        e.timestamp,
        e.isDemo ? "Yes" : "No"
      ]);
      return [headers2.join(","), ...rows2.map((r) => r.join(","))].join("\n");
    }
    if (type === "leads") {
      const headers2 = [
        "Lead ID",
        "Full Name",
        "Email Address",
        "Company Name",
        "Phone Number",
        "Created At",
        "Last Activity",
        "Source",
        "Session ID",
        "Uploaded File Status",
        "Status",
        "Product Category",
        "Requirement",
        "Estimated Quantity",
        "Is Demo"
      ];
      const rows2 = this.store.leads.map((l) => [
        l.lead_id || l.id,
        `"${(l.full_name || l.fullName || "").replace(/"/g, '""')}"`,
        `"${(l.email || "").replace(/"/g, '""')}"`,
        `"${(l.company_name || l.companyName || "").replace(/"/g, '""')}"`,
        `"${(l.phone || "").replace(/"/g, '""')}"`,
        l.created_at || l.createdAt,
        l.last_activity || l.lastActivity || l.created_at || l.createdAt,
        `"${(l.source || "").replace(/"/g, '""')}"`,
        l.session_id || l.sessionId || "",
        `"${(l.uploaded_file_status || "No File Uploaded").replace(/"/g, '""')}"`,
        l.status,
        `"${(l.productCategory || "").replace(/"/g, '""')}"`,
        `"${(l.requirement || "").replace(/"/g, '""')}"`,
        `"${(l.estimatedQuantity || "").replace(/"/g, '""')}"`,
        l.isDemo ? "Yes" : "No"
      ]);
      return [headers2.join(","), ...rows2.map((r) => r.join(","))].join("\n");
    }
    const headers = ["Session ID", "Start Time", "Device Type", "User Mode", "Messages", "Duration (s)", "Primary Concern", "Recommendation", "Enquiry Started", "Enquiry Submitted", "Status", "Is Demo"];
    const rows = this.store.sessions.map((s) => [
      s.id,
      s.startTime,
      s.deviceType,
      s.userMode,
      s.messageCount,
      s.durationSeconds,
      `"${(s.primaryConcern || "").replace(/"/g, '""')}"`,
      `"${(s.recommendationGiven || "").replace(/"/g, '""')}"`,
      s.enquiryStarted ? "Yes" : "No",
      s.enquirySubmitted ? "Yes" : "No",
      s.status,
      s.isDemo ? "Yes" : "No"
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
};
var db = new ResaDatabase();

// server/gemini.ts
var import_genai = require("@google/genai");

// src/data/brands.ts
var RESA_COMPANY_INFO = {
  name: "Resa Life Sci",
  officialName: "Resa Lifescience",
  website: "https://resalifescience.in",
  domain: "resalifescience.in",
  tagline: "Your intelligent beauty & cosmetics assistant",
  businessType: "Cosmetics manufacturing, private-label & contract manufacturing",
  location: "Bawana, New Delhi, India",
  phone: "+91 79718 91443",
  email: "info@resalifescience.in",
  whatsapp: "+917971891443",
  businessAreas: [
    "Cosmetics manufacturing",
    "Private-label manufacturing",
    "Contract manufacturing & filling",
    "Product development & formulation",
    "Haircare manufacturing (Keragraphy, Calveo Professional)",
    "Skincare manufacturing (PH Professional)",
    "Personal-care & body-care manufacturing (The Body Graph, Missfit)",
    "Cosmetic packaging & container sourcing"
  ],
  verifiedNote: "For specific MOQ, production capacities, timelines, and tailored pricing quotes, please connect directly with the Resa Life Sci technical sales team via resalifescience.in or start an enquiry."
};
var RESA_BRANDS = {
  keragraphy: {
    id: "keragraphy",
    name: "Keragraphy",
    category: "Haircare",
    tagline: "Deep restoration & nourishment for rough, depleted hair",
    description: "Specialized professional haircare system designed for intensive restoration, replenishing dry textures, and infusing resilience into rough-feeling hair fibers.",
    primaryBenefits: [
      "Targeted rough texture replenishment",
      "Advanced moisture lock technology",
      "Fiber smoothing & cuticle alignment"
    ],
    recommendedFor: ["Rough Hair", "Dry-Looking Hair", "Tangled Textures"],
    accentColor: "#9C7A5B"
  },
  calveo: {
    id: "calveo",
    name: "Calveo Professional",
    category: "Haircare",
    tagline: "Salon-grade smoothness, luminous shine & frizz control",
    description: "High-performance salon formula engineered to deliver ultra-reflective mirror shine, silk-like touch, and effortless daily manageability.",
    primaryBenefits: [
      "Glass-like luminous shine",
      "Long-lasting frizz shielding",
      "Effortless comb-through & styling control"
    ],
    recommendedFor: ["Smoothness & Shine", "Dull-Looking Hair", "Frizz / Manageability"],
    accentColor: "#B38E5D"
  },
  ph_professional: {
    id: "ph_professional",
    name: "PH Professional",
    category: "Facial Care",
    tagline: "Precision facial care for a refreshed, balanced radiance",
    description: "Dermatologically inspired facial-care formulations designed to revitalize tired, dull-looking skin and promote a clarified, glowing appearance.",
    primaryBenefits: [
      "Radiance revitalization for dull-looking skin",
      "Non-greasy hydration barrier support",
      "Refreshed, balanced skin appearance"
    ],
    recommendedFor: ["Dull-Looking Skin", "Facial Care", "Fresh / Glowing Appearance"],
    accentColor: "#4A6B5D"
  },
  body_graph: {
    id: "body_graph",
    name: "The Body Graph",
    category: "Body Care",
    tagline: "Holistic botanical personal care & wellness rituals",
    description: "Artisanal body care and personal wellness formulas crafted for everyday rejuvenation, gentle nourishment, and sensorial care.",
    primaryBenefits: [
      "Deep body skin hydration",
      "Gentle soothing botanical profiles",
      "Daily personal-care nourishment"
    ],
    recommendedFor: ["General Body Care", "Skin Softening", "Daily Care"],
    accentColor: "#7D6357"
  }
};

// src/data/rules.ts
function evaluateRecommendation(category, concern, preference) {
  const normCategory = (category || "").toLowerCase();
  const normConcern = (concern || "").toLowerCase();
  const normPref = (preference || "").toLowerCase();
  if (normConcern.includes("rough") || normConcern.includes("dry") || normPref.includes("rough") || normPref.includes("replenish")) {
    const brand = RESA_BRANDS.keragraphy;
    return {
      id: "rec_keragraphy_rough",
      brandName: brand.name,
      productCategory: "Haircare",
      headline: "Targeted Restoration for Rough-Looking Hair",
      recommendationWording: "Based on your stated concern about rough-looking hair, Keragraphy may be worth exploring.",
      ctaText: "Explore Keragraphy",
      concernKey: "ROUGH_HAIR",
      brandTagline: brand.tagline,
      keyBenefits: brand.primaryBenefits
    };
  }
  if (normConcern.includes("smooth") || normConcern.includes("shine") || normPref.includes("smooth") || normPref.includes("shine")) {
    const brand = RESA_BRANDS.calveo;
    return {
      id: "rec_calveo_smoothness",
      brandName: brand.name,
      productCategory: "Haircare",
      headline: "Salon-Grade Smoothness & Luminous Gloss",
      recommendationWording: "Since you're looking for smoother and shinier-looking hair, Calveo Professional may be worth exploring.",
      ctaText: "Explore Calveo",
      concernKey: "SMOOTHNESS_SHINE",
      brandTagline: brand.tagline,
      keyBenefits: brand.primaryBenefits
    };
  }
  if (normCategory.includes("hair") && (normConcern.includes("dull") || normConcern.includes("frizz") || normConcern.includes("manageab") || normPref.includes("manageab"))) {
    const brand = RESA_BRANDS.calveo;
    return {
      id: "rec_calveo_manageability",
      brandName: brand.name,
      productCategory: "Haircare",
      headline: "Silky Manageability & Anti-Frizz Control",
      recommendationWording: "Based on your preference for enhanced manageability and revitalizing dull-looking hair, Calveo Professional may be worth exploring.",
      ctaText: "Explore Calveo",
      concernKey: "DULL_HAIR_MANAGEABILITY",
      brandTagline: brand.tagline,
      keyBenefits: brand.primaryBenefits
    };
  }
  if ((normCategory.includes("skin") || normCategory.includes("facial")) && (normConcern.includes("dull") || normConcern.includes("facial") || normConcern.includes("glow") || normConcern.includes("fresh") || normPref.includes("facial") || normPref.includes("glow"))) {
    const brand = RESA_BRANDS.ph_professional;
    return {
      id: "rec_ph_facial_glow",
      brandName: brand.name,
      productCategory: "Facial Care",
      headline: "Revitalizing Radiance & Facial Clarity",
      recommendationWording: "Based on your interest in facial care and dull-looking skin, PH Professional facial-care products may be worth exploring.",
      ctaText: "Explore PH Professional",
      concernKey: "DULL_LOOKING_SKIN",
      brandTagline: brand.tagline,
      keyBenefits: brand.primaryBenefits
    };
  }
  return null;
}

// server/gemini.ts
var aiClient = null;
function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}
var SYSTEM_PROMPT = `You are "Resa AI Assistant", the official intelligent beauty & cosmetics assistant for Resa Life Sci.
Tagline: "Your intelligent beauty & cosmetics assistant".

VERIFIED KNOWLEDGE BASE:
- Company: ${RESA_COMPANY_INFO.name} (${RESA_COMPANY_INFO.officialName})
- Official Website: ${RESA_COMPANY_INFO.website} (${RESA_COMPANY_INFO.domain})
- Business Type: ${RESA_COMPANY_INFO.businessType}
- Location: ${RESA_COMPANY_INFO.location}
- Business Areas: Cosmetics manufacturing, Private-label manufacturing, Contract manufacturing, Product development & formulation, Haircare manufacturing, Skincare manufacturing, Personal-care & body-care manufacturing.
- Official Resa Brands ONLY:
  1. Keragraphy: Deep restoration & nourishment for rough, dry, depleted hair textures.
  2. Calveo Professional: Salon-grade smoothness, mirror-like shine, and frizz manageability.
  3. PH Professional: Targeted facial care for revitalizing dull-looking skin and promoting a refreshed glow.
  4. The Body Graph: Holistic botanical personal care & wellness rituals.
- Contact: Email ${RESA_COMPANY_INFO.email}, Phone ${RESA_COMPANY_INFO.phone}, Website ${RESA_COMPANY_INFO.website}

STRICT CONSTRAINTS & ACCURACY:
1. NEVER invent MOQ, pricing, production capacity, certifications, timelines, or unverified technical specs. If a user asks for exact MOQ or pricing, state:
   "I don't have enough verified information to answer that accurately. Please contact the Resa Life Sci team for confirmation."
2. NEVER diagnose skin or medical conditions, and NEVER claim a cosmetic product cures any disease or medical condition.
3. Use gentle, compliant phrasing: "may be suitable", "may be worth exploring", "based on your stated concern".
4. If a user asks about manufacturing their own brand, private-labeling, or contract manufacturing, explain Resa's manufacturing expertise warmly and invite them to submit an inquiry.
5. Keep answers concise, elegant, and professional. Avoid lengthy corporate essays.`;
async function processChatMessage(params) {
  const { message, history, userMode } = params;
  const userText = message.trim().toLowerCase();
  if (userText.includes("rough") || userText.includes("hair") && userText.includes("rough")) {
    const rec = evaluateRecommendation("Haircare", "Rough Hair", "Smoothness");
    return {
      text: "Based on your stated concern about rough-looking hair, Keragraphy may be worth exploring for its intensive restoring and nourishing care.",
      recommendation: rec,
      detectedMode: "consumer",
      detectedCategory: "Haircare",
      detectedConcern: "Rough Hair"
    };
  }
  if (userText.includes("smooth") && userText.includes("shin") || userText.includes("smooth and shiny") || userText.includes("shiny hair") || userText.includes("smoothness")) {
    const rec = evaluateRecommendation("Haircare", "Smoothness & Shine", "Shine");
    return {
      text: "Since you're looking for smoother and shinier-looking hair, Calveo Professional may be worth exploring.",
      recommendation: rec,
      detectedMode: "consumer",
      detectedCategory: "Haircare",
      detectedConcern: "Smoothness & Shine"
    };
  }
  if (userText.includes("dull") && userText.includes("hair") || userText.includes("frizz") && userText.includes("hair") || userText.includes("manageable")) {
    const rec = evaluateRecommendation("Haircare", "Dull Hair", "Manageability");
    return {
      text: "Based on your preference for enhanced manageability and revitalizing dull-looking hair, Calveo Professional may be worth exploring.",
      recommendation: rec,
      detectedMode: "consumer",
      detectedCategory: "Haircare",
      detectedConcern: "Dull Hair"
    };
  }
  if (userText.includes("dull") && (userText.includes("skin") || userText.includes("face")) || userText.includes("facial") && (userText.includes("dull") || userText.includes("glow"))) {
    const rec = evaluateRecommendation("Facial Care", "Dull-Looking Skin", "Facial Care");
    return {
      text: "Based on your interest in facial care and dull-looking skin, PH Professional facial-care products may be worth exploring.",
      recommendation: rec,
      detectedMode: "consumer",
      detectedCategory: "Facial Care",
      detectedConcern: "Dull-Looking Skin"
    };
  }
  if (userText.includes("moq") || userText.includes("minimum order") || userText.includes("exact price") || userText.includes("how much does it cost")) {
    return {
      text: "I don't have enough verified information to answer that accurately. Minimum order quantities and pricing depend on custom formulation, packaging specifications, and batch sizes. Please contact the Resa Life Sci team for confirmation or start a business enquiry below.",
      detectedMode: "business",
      showEnquiryAction: true
    };
  }
  if (userText.includes("start my own") || userText.includes("shampoo brand") || userText.includes("private label") || userText.includes("private-label") || userText.includes("contract manufacturing") || userText.includes("manufacture skincare") || userText.includes("launch a cosmetic") || userText.includes("launch my brand") || userText.includes("start a brand")) {
    return {
      text: "Resa Life Sci specializes in state-of-the-art cosmetics manufacturing and private-label / contract manufacturing out of Bawana, New Delhi. We assist entrepreneurs and established brands across haircare, skincare, and personal-care product development. You can submit your requirements directly to our technical team.",
      detectedMode: "business",
      showEnquiryAction: true,
      quickActions: [
        { label: "Start Business Enquiry", action: "start_enquiry" },
        { label: "Contact Resa via WhatsApp", action: "whatsapp" }
      ]
    };
  }
  if (userText.includes("what does resa life sci do") || userText.includes("what do you do") || userText.includes("about resa") || userText.includes("what does resa do")) {
    return {
      text: "Resa Life Sci (Resa Lifescience) is a premier cosmetics manufacturing and private-label / contract manufacturing company based in Bawana, New Delhi, India. We specialize in product development, formulation, and manufacturing across haircare, skincare, and personal-care categories, alongside our portfolio of specialized brands.",
      detectedMode: "general",
      quickActions: [
        { label: "\u{1F9F4} Find My Beauty Product", action: "find_beauty" },
        { label: "\u{1F3ED} Manufacturing & Private Label", action: "manufacturing" },
        { label: "\u2728 Explore Resa Brands", action: "explore_brands" },
        { label: "\u{1F310} Official Website", action: "visit_website" }
      ]
    };
  }
  if (userText.includes("resalifescience.in") || userText.includes("resalifescience") || userText === "website" || userText.includes("official website") || userText.includes("what is the website") || userText.includes("website link")) {
    return {
      text: "\u{1F310} **resalifescience.in** is the official web portal of **Resa Life Sci (Resa Lifescience)** \u2014 specialists in cosmetics manufacturing, private-label formulation, contract filling, and beauty brand stewardship based in Bawana, New Delhi, India.\n\nOn the portal, you can discover our specialized brands (**Keragraphy**, **Calveo Professional**, **PH Professional**, **The Body Graph**), review private-label manufacturing capabilities, or request tailored batch quotes.",
      detectedMode: "general",
      quickActions: [
        { label: "\u{1F310} Open resalifescience.in", action: "visit_website" },
        { label: "\u{1F3ED} Start Manufacturing Enquiry", action: "start_enquiry" },
        { label: "\u2728 Explore Resa Brands", action: "explore_brands" },
        { label: "\u{1F4DE} Contact Technical Team", action: "contact_resa" }
      ]
    };
  }
  const client = getAiClient();
  if (client) {
    try {
      const formattedContents = [
        ...history.map((h) => ({
          role: h.role,
          parts: h.parts
        })),
        {
          role: "user",
          parts: [{ text: message }]
        }
      ];
      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.4,
          maxOutputTokens: 500
        }
      });
      const responseText = response.text || "Hello! I'm here to assist you with consumer beauty product recommendations or contract manufacturing inquiries for Resa Life Sci.";
      const isBusiness = userText.includes("manufactur") || userText.includes("brand") || userText.includes("contract") || userText.includes("order") || userText.includes("b2b");
      return {
        text: responseText,
        detectedMode: isBusiness ? "business" : "consumer"
      };
    } catch (err) {
      console.warn("Gemini API call failed, using graceful fallback:", err);
    }
  }
  return {
    text: "Welcome to Resa Life Sci. I can help you discover the ideal haircare or facial-care regimen across our official brands (Keragraphy, Calveo Professional, PH Professional, The Body Graph), or guide you through contract cosmetics manufacturing.",
    detectedMode: userMode || "general",
    quickActions: [
      { label: "\u{1F9F4} Find My Beauty Product", action: "find_beauty" },
      { label: "\u{1F3ED} Manufacturing & Private Label", action: "manufacturing" }
    ]
  };
}

// server/email.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var ADMIN_LEAD_EMAIL = process.env.ADMIN_LEAD_EMAIL || "vs059899@gmail.com";
var transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  if (host && user && pass) {
    try {
      transporter = import_nodemailer.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
      return transporter;
    } catch (err) {
      console.error("[EmailService] Failed to create SMTP transporter:", err);
      return null;
    }
  }
  return null;
}
function formatDateTime(isoString) {
  try {
    const d = new Date(isoString);
    const dateFormatted = d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium"
    });
    return `${dateFormatted} (IST) / ${d.toISOString()}`;
  } catch {
    return isoString;
  }
}
async function sendAdminLeadNotification(lead) {
  const recipient = ADMIN_LEAD_EMAIL;
  const formattedDate = formatDateTime(lead.created_at || lead.createdAt || (/* @__PURE__ */ new Date()).toISOString());
  const fullName = lead.full_name || lead.fullName || "Anonymous";
  const companyName = lead.company_name || lead.companyName || "Not specified";
  const phone = lead.phone || "Not provided";
  const email = lead.email;
  const source = lead.source || "Chatbot Consultation";
  const uploadedFileStatus = lead.uploaded_file_status || "No File Uploaded";
  const subject = `[Resa AI] New Lead Notification: ${fullName} (${companyName})`;
  const textContent = `
======================================================================
NEW LEAD NOTIFICATION
Resa AI Assistant & Analytics Platform
======================================================================

You have received a new lead submission from the Resa AI Assistant.

\u2022 Full Name: ${fullName}
\u2022 Email Address: ${email}
\u2022 Company Name: ${companyName}
\u2022 Phone Number: ${phone}
\u2022 Date and Time: ${formattedDate}
\u2022 Source: ${source}
\u2022 Whether a file was uploaded: ${uploadedFileStatus}
\u2022 Session ID: ${lead.session_id || lead.sessionId || "N/A"}
\u2022 Requirement: ${lead.requirement || "General enquiry"}
\u2022 Product Category: ${lead.productCategory || "General Cosmetics"}

Link to Admin Portal: ${process.env.APP_URL || "https://resalifescience.in"}
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
          <td style="padding: 12px 0; color: #8C867D; font-size: 12px; font-family: monospace;">${lead.session_id || lead.sessionId || "N/A"}</td>
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
  const notificationRecord = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    leadId: lead.lead_id || lead.id,
    recipient,
    subject,
    sentAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "logged",
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
      notificationRecord.status = "delivered";
      console.log(`[EmailService] Lead notification sent successfully to ${recipient}. MessageId: ${info.messageId}`);
      return {
        success: true,
        status: "delivered",
        messageId: info.messageId,
        record: notificationRecord
      };
    } catch (err) {
      console.error(`[EmailService] Failed to send email via SMTP to ${recipient}:`, err);
      notificationRecord.status = "failed";
      notificationRecord.error = err.message || "SMTP delivery failed";
      logToConsole(recipient, subject, textContent);
      return {
        success: false,
        status: "failed",
        error: err.message,
        record: notificationRecord
      };
    }
  }
  notificationRecord.status = "logged";
  logToConsole(recipient, subject, textContent);
  return {
    success: true,
    status: "logged",
    record: notificationRecord
  };
}
function logToConsole(recipient, subject, text) {
  console.log(`
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 \u{1F4E7} [LEAD NOTIFICATION DISPATCHED]                                      \u2502
\u2502 Recipient: ${recipient.padEnd(58)}\u2502
\u2502 Subject:   ${subject.substring(0, 58).padEnd(58)}\u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
${text.trim().split("\n").map((line) => `\u2502 ${line.substring(0, 70).padEnd(70)} \u2502`).join("\n")}
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
`);
}

// server/integrations.ts
async function dispatchLead(lead) {
  const result = {
    email: {
      dispatched: false,
      status: "logged",
      recipient: "vs059899@gmail.com"
    }
  };
  try {
    const emailRes = await sendAdminLeadNotification(lead);
    result.email = {
      dispatched: true,
      status: emailRes.status,
      recipient: emailRes.record.recipient,
      error: emailRes.error
    };
  } catch (err) {
    console.error("[Integrations] Email notification error:", err);
    result.email.error = err.message;
  }
  const webhookUrl = process.env.CRM_WEBHOOK_URL || process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lead.created",
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
        status: resp.ok ? "sent" : "failed",
        error: resp.ok ? void 0 : `HTTP ${resp.status}`
      };
    } catch (err) {
      console.warn("[Integrations] CRM webhook dispatch failed:", err.message);
      result.crmWebhook = { attempted: true, status: "failed", error: err.message };
    }
  } else {
    result.crmWebhook = { attempted: false, status: "skipped" };
  }
  const waApiKey = process.env.WHATSAPP_API_KEY;
  if (waApiKey) {
    result.whatsAppNotify = { attempted: true, status: "queued" };
  } else {
    result.whatsAppNotify = { attempted: false, status: "skipped" };
  }
  return result;
}

// server.ts
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed) && trimmed.length <= 254;
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const validAdminTokens = /* @__PURE__ */ new Set();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized admin access" });
    }
    const token = authHeader.split(" ")[1];
    if (!validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Session expired or invalid token" });
    }
    next();
  };
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Resa AI Assistant API" });
  });
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      validAdminTokens.add(token);
      return res.json({ success: true, token });
    }
    return res.status(401).json({ success: false, error: "Invalid admin credentials" });
  });
  app.post("/api/admin/verify", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (validAdminTokens.has(token)) {
        return res.json({ valid: true });
      }
    }
    res.json({ valid: false });
  });
  app.post("/api/admin/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      validAdminTokens.delete(authHeader.split(" ")[1]);
    }
    res.json({ success: true });
  });
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, sessionId, userMode } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ error: "Missing message or sessionId" });
      }
      const result = await processChatMessage({
        message,
        history: history || [],
        sessionId,
        userMode
      });
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
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: "Failed to process message" });
    }
  });
  app.post("/api/analytics/events", (req, res) => {
    try {
      const event = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sessionId: req.body.sessionId,
        eventType: req.body.eventType,
        category: req.body.category,
        concern: req.body.concern,
        brandRecommended: req.body.brandRecommended,
        metadata: req.body.metadata,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.addEvent(event);
      const session = db.getSessionById(event.sessionId);
      if (session) {
        const updates = {};
        if (event.concern) updates.primaryConcern = event.concern;
        if (event.brandRecommended) updates.recommendationGiven = event.brandRecommended;
        if (event.eventType === "ENQUIRY_STARTED") updates.enquiryStarted = true;
        if (event.eventType === "ENQUIRY_SUBMITTED") updates.enquirySubmitted = true;
        if (event.eventType === "WHATSAPP_CLICKED") updates.contactActionTaken = "WhatsApp";
        if (event.eventType === "CALL_CLICKED") updates.contactActionTaken = "Call";
        if (event.eventType === "CONTACT_CLICKED") updates.contactActionTaken = "Contact Us";
        if (Object.keys(updates).length > 0) {
          db.updateSession(event.sessionId, updates);
        }
      }
      res.json({ success: true, event });
    } catch (err) {
      console.error("Error recording event:", err);
      res.status(500).json({ error: "Failed to record event" });
    }
  });
  app.post("/api/analytics/sessions", (req, res) => {
    try {
      const { id, deviceType, userMode } = req.body;
      const session = {
        id: id || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        startTime: (/* @__PURE__ */ new Date()).toISOString(),
        deviceType: deviceType || "Desktop",
        userMode: userMode || "general",
        messageCount: 0,
        durationSeconds: 0,
        status: "active",
        enquiryStarted: false,
        enquirySubmitted: false
      };
      db.addSession(session);
      res.json({ success: true, session });
    } catch (err) {
      console.error("Error creating session:", err);
      res.status(500).json({ error: "Failed to create session" });
    }
  });
  app.patch("/api/analytics/sessions/:id", (req, res) => {
    try {
      const updated = db.updateSession(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ success: true, session: updated });
    } catch (err) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });
  app.get("/api/analytics/sessions", authMiddleware, (req, res) => {
    res.json(db.getSessions());
  });
  app.get("/api/analytics/metrics", authMiddleware, (req, res) => {
    try {
      const range = req.query.range || "30days";
      const customStart = req.query.start;
      const customEnd = req.query.end;
      const metrics = db.getMetrics(range, customStart, customEnd);
      res.json(metrics);
    } catch (err) {
      console.error("Metrics calculation error:", err);
      res.status(500).json({ error: "Failed to compute metrics" });
    }
  });
  app.post("/api/leads/capture", async (req, res) => {
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
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address."
        });
      }
      const { lead, isNew } = db.addOrUpdateLead({
        fullName: fullName || "Valued Visitor",
        email,
        companyName: companyName || "",
        phone: phone || "",
        source: source || "Chatbot Consultation",
        sessionId,
        uploadedFileStatus: uploadedFileStatus || "No File Uploaded",
        productCategory: productCategory || "General Cosmetics",
        requirement: requirement || "Consultation / Lead Capture",
        estimatedQuantity
      });
      db.addEvent({
        id: `ev_${Date.now()}_lead_cap`,
        sessionId: sessionId || lead.lead_id,
        eventType: "ENQUIRY_SUBMITTED",
        category: "Business",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (sessionId) {
        db.updateSession(sessionId, {
          enquirySubmitted: true,
          leadId: lead.lead_id,
          leadEmail: lead.email,
          leadName: lead.full_name
        });
      }
      let dispatchInfo = null;
      if (isNew) {
        try {
          const emailSend = await sendAdminLeadNotification(lead);
          db.addNotification(emailSend.record);
          dispatchInfo = await dispatchLead(lead);
        } catch (notifErr) {
          console.error("Notification dispatch error:", notifErr);
        }
      }
      return res.json({
        success: true,
        message: "Thanks! Your details have been saved.",
        lead,
        isNew,
        dispatchInfo
      });
    } catch (err) {
      console.error("Lead capture error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to save lead information."
      });
    }
  });
  app.post("/api/leads", async (req, res) => {
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
          error: "Please enter a valid email address."
        });
      }
      const { lead, isNew } = db.addOrUpdateLead({
        fullName: fullName || "Manufacturing Inquirer",
        companyName: companyName || "",
        phone: phone || "",
        email,
        productCategory: productCategory || "General Cosmetics",
        requirement: requirement || "General business enquiry",
        estimatedQuantity,
        sessionId,
        source: source || "Business Manufacturing Enquiry",
        uploadedFileStatus: uploadedFileStatus || "No File Uploaded"
      });
      db.addEvent({
        id: `ev_${Date.now()}_enq_sub`,
        sessionId: sessionId || lead.lead_id,
        eventType: "ENQUIRY_SUBMITTED",
        category: "Business",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (sessionId) {
        db.updateSession(sessionId, {
          enquirySubmitted: true,
          leadId: lead.lead_id,
          leadEmail: lead.email,
          leadName: lead.full_name
        });
      }
      if (isNew) {
        try {
          const emailSend = await sendAdminLeadNotification(lead);
          db.addNotification(emailSend.record);
          await dispatchLead(lead);
        } catch (notifErr) {
          console.error("Notification dispatch error:", notifErr);
        }
      }
      res.json({
        success: true,
        message: "Thanks! Your details have been saved.",
        lead,
        isNew
      });
    } catch (err) {
      console.error("Lead submission error:", err);
      res.status(500).json({ success: false, error: "Failed to submit enquiry" });
    }
  });
  app.get("/api/leads", authMiddleware, (req, res) => {
    res.json(db.getLeads());
  });
  app.get("/api/admin/leads/:id", authMiddleware, (req, res) => {
    const details = db.getLeadDetails(req.params.id);
    if (!details) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.json({ success: true, ...details });
  });
  app.get("/api/admin/notifications", authMiddleware, (req, res) => {
    res.json(db.getNotifications());
  });
  app.patch("/api/leads/:id/status", authMiddleware, (req, res) => {
    const { status } = req.body;
    const updated = db.updateLeadStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.json({ success: true, lead: updated });
  });
  app.post("/api/admin/demo-data/generate", authMiddleware, (req, res) => {
    const result = db.generateDemoData();
    res.json({ success: true, ...result });
  });
  app.post("/api/admin/demo-data/clear", authMiddleware, (req, res) => {
    const result = db.clearDemoData();
    res.json({ success: true, ...result });
  });
  app.get("/api/admin/export/:type", authMiddleware, (req, res) => {
    const type = req.params.type;
    if (!["events", "leads", "sessions"].includes(type)) {
      return res.status(400).send("Invalid export type");
    }
    const csvData = db.exportCsv(type);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=resa_${type}_export_${Date.now()}.csv`);
    res.send(csvData);
  });
  process.on("uncaughtException", (err) => {
    console.error("[ResaServer] Uncaught Exception:", err);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[ResaServer] Unhandled Rejection at:", promise, "reason:", reason);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const baseDir = process.cwd();
    const candidateDistPaths = [
      import_path2.default.join(baseDir, "dist"),
      import_path2.default.join(baseDir, "public_html"),
      baseDir
    ];
    const distPath = candidateDistPaths.find((p) => import_fs2.default.existsSync(import_path2.default.join(p, "index.html"))) || import_path2.default.join(baseDir, "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      const indexPath = import_path2.default.join(distPath, "index.html");
      if (import_fs2.default.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      return res.status(404).send("Not Found");
    });
  }
  const rawPort = process.env.NODE_ENV === "production" && process.env.PORT ? process.env.PORT : 3e3;
  if (typeof rawPort === "string" && isNaN(Number(rawPort))) {
    app.listen(rawPort, () => {
      console.log(`Server running on Passenger socket: ${rawPort}`);
    });
  } else {
    const portNumber = Number(rawPort);
    app.listen(portNumber, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${portNumber}`);
    });
  }
}
startServer();
//# sourceMappingURL=server.cjs.map
