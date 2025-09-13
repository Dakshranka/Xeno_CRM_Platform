// Analytics API endpoints for charts
const express = require('express');
const router = express.Router();

// Dummy data for now (replace with DB queries as needed)
const weeklyData = [
  { day: 'Mon', delivered: 8500, opened: 2040, clicked: 578 },
  { day: 'Tue', delivered: 9200, opened: 2484, clicked: 697 },
  { day: 'Wed', delivered: 7800, opened: 1872, clicked: 449 },
  { day: 'Thu', delivered: 10400, opened: 2496, clicked: 749 },
  { day: 'Fri', delivered: 11200, opened: 2912, clicked: 896 },
  { day: 'Sat', delivered: 6900, opened: 1656, clicked: 331 },
  { day: 'Sun', delivered: 5600, opened: 1288, clicked: 224 }
];

const performanceData = [
  { date: '2025-01-14', sent: 12500, delivered: 12245, opened: 3061, clicked: 734 },
  { date: '2025-01-15', sent: 15200, delivered: 14896, opened: 4019, clicked: 884 },
  { date: '2025-01-16', sent: 9800, delivered: 9604, opened: 2401, clicked: 552 },
  { date: '2025-01-17', sent: 18400, delivered: 18032, opened: 4868, clicked: 1097 },
  { date: '2025-01-18', sent: 11200, delivered: 10976, opened: 3293, clicked: 725 },
  { date: '2025-01-19', sent: 16900, delivered: 16562, opened: 4486, clicked: 963 },
  { date: '2025-01-20', sent: 13600, delivered: 13328, opened: 3731, clicked: 839 }
];

// GET /api/analytics/weekly
router.get('/weekly', (req, res) => {
  res.json(weeklyData);
});

// GET /api/analytics/performance
router.get('/performance', (req, res) => {
  res.json(performanceData);
});

module.exports = router;
