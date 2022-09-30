const cors = require('cors');
const express = require('express');
const httpErrors = require('http-errors');
const cookieParser = require('cookie-parser');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://talky-talk.vercel.app'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

/* -------- Serving Static Files ----------- */
app.use('/storage', express.static('storage/'));

/* --------- API Routes ----------- */
app.get('/', (req, res) => {
  const routes = require('./API');
  return res.status(200).json({
    ok: true,
    statusCode: 200,
    statusText: 'Hello from Talky.',
    routes,
  });
});

app.use('/api', require('./routes'));

// --------------- 404 Error Handler --------------- //
app.use((req, res, next) => next(httpErrors.NotFound()));

// --------------- Global Error Handler --------------- //
app.use((error, req, res, next) => {
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
