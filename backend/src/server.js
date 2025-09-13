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

// Allow both local and deployed frontend
const allowedOrigins = [
  'http://localhost:5173', // local Vite frontend
  'https://xeno-crm-platform-lilac.vercel.app',
  'https://xeno-crm-platform.onrender.com'
];

app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `CORS policy does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

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
