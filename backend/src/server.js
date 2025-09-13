const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('./config/passport');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const analyticsRoutes = require('./routes/analytics');
const campaignsRoutes = require('./routes/campaigns');
const communicationLogRoutes = require('./routes/communicationLog');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Initialize passport
app.use(passport.initialize());

app.get('/', (_req, res) => {
  res.json({ status: 'Backend running' });
});

app.use('/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', campaignsRoutes);
app.use('/api', communicationLogRoutes);

const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
