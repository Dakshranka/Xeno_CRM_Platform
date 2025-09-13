const express = require('express');
const router = express.Router();
const CommunicationLog = require('../models/CommunicationLog');
const { jwtMiddleware } = require('../middleware/jwt');

// GET /api/communication-logs?campaignId=xxx
router.get('/communication-logs', jwtMiddleware, async (req, res) => {
  try {
    const { campaignId } = req.query;
    const query = campaignId ? { campaignId } : {};
    const logs = await CommunicationLog.find(query).populate('userId', 'name email');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch communication logs', details: err?.message });
  }
});

module.exports = router;
