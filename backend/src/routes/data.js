
const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const DataSource = require('../models/DataSource');
const DataRecord = require('../models/DataRecord');
// AI: Data Auto-Fix

router.post('/data/autofix', async (req, res) => {
  try {
    const { records } = req.body;
    // Prompt Gemini to auto-fix data issues (formatting, duplicates, etc.)
    const prompt = `Auto-fix common CRM data quality issues (formatting, duplicates, missing fields) in these records. Return fixed records and a count: ${JSON.stringify(records)}`;
    const aiRes = await aiService.callGemini(prompt);
    // Expect AI to return a JSON block with fixedData and fixedCount
    let fixedData = [];
    let fixedCount = 0;
    let success = false;
    let error = '';
    try {
      const match = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text?.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        fixedData = result.fixedData || [];
        fixedCount = result.fixedCount || fixedData.length;
        success = true;
      } else {
        error = 'AI did not return valid fixed data.';
      }
    } catch (e) {
      error = 'Failed to parse AI response.';
    }
    res.json({ success, fixedData, fixedCount, error });
  } catch (err) {
    res.status(500).json({ success: false, error: 'AI auto-fix failed' });
  }
});


// AI: Data Validation Insights
// Alias: /api/data/validate (for frontend compatibility)
router.post('/data/validate', async (req, res) => {
  try {
    const { records } = req.body;
    const prompt = `Analyze these CRM data records and provide validation insights, issues, and recommendations: ${JSON.stringify(records)}`;
    const aiRes = await aiService.callGemini(prompt);
    const insight = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ insight });
  } catch (err) {
    res.status(500).json({ error: 'AI data validation failed' });
  }
});
router.post('/ai/data-validation', async (req, res) => {
  try {
    const { records } = req.body;
    const prompt = `Analyze these CRM data records and provide validation insights, issues, and recommendations: ${JSON.stringify(records)}`;
    const aiRes = await aiService.callGemini(prompt);
    const insight = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ insight });
  } catch (err) {
    res.status(500).json({ error: 'AI data validation failed' });
  }
});

// GET /api/data-sources
router.get('/data-sources', async (req, res) => {
  try {
    const sources = await DataSource.find();
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data sources' });
  }
});

// GET /api/data-records
// POST /api/customers (ingest customer data)
const User = require('../models/User');
router.post('/customers', async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Missing required fields' });
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ googleId, email, name, avatar });
    }
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to ingest customer', details: err?.message });
  }
});

// POST /api/orders (ingest order data)
const Order = require('../models/Order');
router.post('/orders', async (req, res) => {
  try {
    const { userId, orderId, amount, status, items } = req.body;
    if (!userId || !orderId || !amount) return res.status(400).json({ error: 'Missing required fields' });
    const order = await Order.create({ userId, orderId, amount, status, items });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to ingest order', details: err?.message });
  }
});
router.get('/data-records', async (req, res) => {
  try {
    const records = await DataRecord.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data records' });
  }
});
  // POST /data-records (ingest data records)
  router.post('/data-records', async (req, res) => {
    try {
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'No records provided' });
      }
      // Add timestamps if not present
      const recordsWithTimestamps = records.map(r => ({
        ...r,
        createdAt: r.createdAt || new Date(),
        updatedAt: r.updatedAt || new Date()
      }));
      const savedRecords = await DataRecord.insertMany(recordsWithTimestamps);
      res.status(201).json(savedRecords);
    } catch (err) {
      res.status(500).json({ error: 'Failed to ingest data records', details: err?.message });
    }
  });

module.exports = router;
