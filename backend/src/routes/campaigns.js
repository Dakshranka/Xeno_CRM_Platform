// POST /api/campaigns/:id/simulate-open
const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const Campaign = require('../models/Campaign');
const { jwtMiddleware } = require('../middleware/jwt');
router.post('/campaigns/:id/simulate-open', jwtMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { percentage = 60 } = req.body; // default 60% open
    const CommunicationLog = require('../models/CommunicationLog');
    const logs = await CommunicationLog.find({ campaignId, status: 'SENT', openedAt: { $exists: false } });
    const toOpen = Math.floor((percentage / 100) * logs.length);
    const selected = logs.slice(0, toOpen);
    await Promise.all(selected.map(log => {
      log.openedAt = new Date();
      return log.save();
    }));
    res.json({ opened: selected.length, total: logs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to simulate open', details: err?.message });
  }
});

// POST /api/campaigns/:id/simulate-click
router.post('/campaigns/:id/simulate-click', jwtMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { percentage = 30 } = req.body; // default 30% click
    const CommunicationLog = require('../models/CommunicationLog');
    const logs = await CommunicationLog.find({ campaignId, status: 'SENT', openedAt: { $exists: true }, clickedAt: { $exists: false } });
    const toClick = Math.floor((percentage / 100) * logs.length);
    const selected = logs.slice(0, toClick);
    await Promise.all(selected.map(log => {
      log.clickedAt = new Date();
      return log.save();
    }));
    res.json({ clicked: selected.length, total: logs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to simulate click', details: err?.message });
  }
});
const { scheduleCampaignSend } = require('../scheduler/scheduleCampaign');
// POST /api/campaigns/:id/schedule
router.post('/campaigns/:id/schedule', jwtMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { scheduledAt } = req.body; // ISO string or Date
    if (!scheduledAt) return res.status(400).json({ error: 'scheduledAt required' });
    scheduleCampaignSend(campaignId, new Date(scheduledAt));
    res.json({ status: 'Scheduled', campaignId, scheduledAt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to schedule campaign', details: err?.message });
  }
});


router.get('/campaigns/:id/realtime-stats', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const CommunicationLog = require('../models/CommunicationLog');
    const logs = await CommunicationLog.find({ campaignId });
    // Count sent, opened, clicked
    const sent = logs.filter(l => l.status === 'SENT').length;
    const opened = logs.filter(l => l.openedAt).length;
    const clicked = logs.filter(l => l.clickedAt).length;
    // Calculate rates
    const avgOpenRate = sent > 0 ? opened / sent : 0;
    const avgClickRate = sent > 0 ? clicked / sent : 0;
    const avgEngagementRate = sent > 0 ? (opened + clicked) / sent : 0;
    // Aggregate by day for graph
    const dayMap = {};
    logs.forEach(l => {
      const day = l.sentAt ? l.sentAt.toLocaleString('en-US', { weekday: 'short' }) : 'Unknown';
      if (!dayMap[day]) dayMap[day] = { delivered: 0, opened: 0, clicked: 0 };
      if (l.status === 'SENT') dayMap[day].delivered++;
      if (l.openedAt) dayMap[day].opened++;
      if (l.clickedAt) dayMap[day].clicked++;
    });
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const graphData = daysOfWeek.map(day => ({
      day,
      delivered: dayMap[day]?.delivered || 0,
      opened: dayMap[day]?.opened || 0,
      clicked: dayMap[day]?.clicked || 0
    }));
    res.json({ sent, opened, clicked, avgOpenRate, avgClickRate, avgEngagementRate, graphData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch real-time stats', details: err?.message });
  }
});

// AI: Smart Scheduling Suggestions

router.post('/ai/smart-schedule', async (req, res) => {
  try {
    const { audience, history } = req.body;
    const prompt = `Based on this audience and campaign history, recommend the best time and day to send a campaign for maximum engagement: ${JSON.stringify({ audience, history })}`;
    const aiRes = await aiService.callGemini(prompt);
    const suggestion = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: 'AI smart schedule failed' });
  }
});

// AI: Audience Lookalike Generator
router.post('/ai/lookalike', async (req, res) => {
  try {
    const { segment } = req.body;
    const prompt = `Given this high-performing audience segment, suggest additional lookalike audiences: ${JSON.stringify(segment)}`;
    const aiRes = await aiService.callGemini(prompt);
    const lookalikes = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ lookalikes });
  } catch (err) {
    res.status(500).json({ error: 'AI lookalike generator failed' });
  }
});

// AI: Auto-tagging Campaigns
router.post('/ai/auto-tag', async (req, res) => {
  try {
    const { audience, message } = req.body;
    const prompt = `Label this campaign based on its audience and message intent: ${JSON.stringify({ audience, message })}`;
    const aiRes = await aiService.callGemini(prompt);
    const tag = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ tag });
  } catch (err) {
    res.status(500).json({ error: 'AI auto-tagging failed' });
  }
});


// AI: Dashboard Audience Insights
router.post('/ai/dashboard-insight', async (req, res) => {
  try {
    const { audience } = req.body;
    const prompt = `Analyze this CRM audience data and provide actionable insights and recommendations: ${JSON.stringify(audience)}`;
    const aiRes = await aiService.callGemini(prompt);
    const insight = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ insight });
  } catch (err) {
    res.status(500).json({ error: 'AI dashboard insight failed' });
  }
});

// AI: Natural Language → Segment Rules
router.post('/ai/segment-rules', async (req, res) => {
  try {
    const { input } = req.body;
    const prompt = `Convert this segment description to JSON rules for MongoDB: ${input}`;
    const aiRes = await aiService.callGemini(prompt);
    // Extract JSON from Gemini response
    const match = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text?.match(/\{[\s\S]*\}/);
    const rules = match ? JSON.parse(match[0]) : {};
    res.json({ rules });
  } catch (err) {
    res.status(500).json({ error: 'AI segment rules failed' });
  }
});

// AI: Message Suggestions
router.post('/ai/messages', async (req, res) => {
  try {
    const { input } = req.body;
    const prompt = `Suggest 3 CRM campaign messages for this objective: ${input}`;
    const aiRes = await aiService.callGemini(prompt);
    // Extract messages from Gemini response
    const text = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const messages = text.split(/\n\n|\n/).filter(Boolean).slice(0, 3);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'AI message suggestions failed' });
  }
});

// AI: Campaign Performance Summaries
router.post('/ai/performance-summary', async (req, res) => {
  try {
    const { stats } = req.body;
    const prompt = `Write a human-readable summary for these CRM campaign stats: ${JSON.stringify(stats)}`;
    const aiRes = await aiService.callGemini(prompt);
    const summary = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'AI performance summary failed' });
  }
});
// ...existing code...

// GET /api/campaigns (for logged-in user)
router.get('/campaigns', jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
      const campaigns = await Campaign.find({ userId });
      // Map _id to id for frontend compatibility
      const mappedCampaigns = campaigns.map(c => ({
        ...c.toObject(),
        id: c._id,
      }));
      res.json(mappedCampaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// POST /api/campaigns (create campaign for logged-in user)
router.post('/campaigns', jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      console.error('No userId found in JWT payload:', req.user);
      return res.status(401).json({ error: 'Unauthorized: No userId in JWT' });
    }
    const campaign = new Campaign({ ...req.body, userId });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(500).json({ error: 'Failed to create campaign', details: err?.message });
  }
});

module.exports = router;

// POST /api/campaigns/audience-preview (preview audience size for segment rules)
const User = require('../models/User');
router.post('/campaigns/audience-preview', jwtMiddleware, async (req, res) => {
  try {
    const { rules } = req.body;
    // For demo, rules is a MongoDB query object
    const audience = await User.find(rules || {});
    res.json({ size: audience.length, audience });
  } catch (err) {
    res.status(500).json({ error: 'Failed to preview audience', details: err?.message });
  }
});

// --- Campaign Delivery Simulation & Logging ---
const CommunicationLog = require('../models/CommunicationLog');

// POST /api/campaigns/:id/send (simulate sending campaign)
router.post('/campaigns/:id/send', jwtMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    // Find target audience (for demo, all users)
    const User = require('../models/User');
    const users = await User.find();
    // Simulate sending messages
    const logs = await Promise.all(users.map(async user => {
      // Simulate delivery (90% SENT, 10% FAILED)
      const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
      const message = `Hi ${user.name}, here’s 10% off on your next order!`;
      // Simulate engagement: 60% opened, 30% clicked (of sent)
      let openedAt = undefined;
      let clickedAt = undefined;
      if (status === 'SENT' && Math.random() < 0.6) {
        openedAt = new Date(Date.now() + Math.floor(Math.random() * 60000)); // opened within 1 min
        if (Math.random() < 0.5) {
          clickedAt = new Date(Date.now() + Math.floor(Math.random() * 120000)); // clicked within 2 min
        }
      }
      const log = await CommunicationLog.create({
        campaignId,
        userId: user._id,
        channel: campaign.type || 'email',
        status,
        message,
        sentAt: new Date(),
        openedAt,
        clickedAt,
      });
      // Simulate hitting vendor API (dummy)
      setTimeout(() => {
        // Simulate vendor calling delivery receipt
        // For demo, just update status again
      }, 100);
      return log;
    }));
    res.json({ sent: logs.filter(l => l.status === 'SENT').length, failed: logs.filter(l => l.status === 'FAILED').length, total: logs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send campaign', details: err?.message });
  }
});

// POST /api/vendor/send (dummy vendor API)
router.post('/vendor/send', async (req, res) => {
  // Simulate vendor delivery (90% success)
  const { campaignId, userId, channel, message } = req.body;
  const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
  // Simulate vendor calling delivery receipt
  setTimeout(() => {
    // For demo, just call receipt API
  }, 100);
  res.json({ status });
});

// POST /api/delivery-receipt (update delivery status)
router.post('/delivery-receipt', async (req, res) => {
  try {
    const { logId, status } = req.body;
    const log = await CommunicationLog.findById(logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    log.status = status;
    log.updatedAt = new Date();
    await log.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery status', details: err?.message });
  }
});
