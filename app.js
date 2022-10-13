const cors = require('cors');
const express = require('express');
const httpErrors = require('http-errors');
const cookieParser = require('cookie-parser');

const app = express();

// HEROKU CONFIG
app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://talky-talk.vercel.app'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Serving Static Files i.e User Avatars
app.use('/storage', express.static('storage/'));

// API routes
app.use('/api', require('./routes'));

// 404 Error Handler
app.use((_req, _res, next) => next(httpErrors.NotFound()));

//  Global Error Handler
app.use((error, _req, res, _next) => {
  if (error.status === 404)
    return res.status(404).json({
      ok: false,
      message: error.message || 'Not Found.',
      statusCode: 404,
    });
  else
    return res.status(error.status || 500).json({
      ok: false,
      statusCode: error.status || 500,
      message: error.message || 'Internal Server Error.',
    });
});

module.exports = app;
