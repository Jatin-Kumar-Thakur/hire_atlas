require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');

const connectDB      = require('./config/db');
const errorHandler   = require('./middleware/errorHandler');
const { initCronJobs } = require('./utils/cronJobs');

const authRoutes         = require('./routes/authRoutes');
const applicationRoutes  = require('./routes/applicationRoutes');
const userRoutes         = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes    = require('./routes/analyticsRoutes');

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err);
  process.exit(1);
});

connectDB();
initCronJobs();

const app = express();

app.use(compression());
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_WWW,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || /^chrome-extension:\/\//.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth',          authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics',    analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
