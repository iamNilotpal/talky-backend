const express = require('express');
const httpErrors = require('http-errors');

const app = express();
app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) =>
  res
    .status(200)
    .json({ status: 'ok', statusCode: 200, message: 'Hello from Talky.' })
);

// --------------- 404 Error Handler --------------- //
app.use((req, res, next) => next(httpErrors.NotFound()));

// --------------- Global Error Handler --------------- //
app.use((error, req, res, next) => {
  if (error.status === 404)
    return res.status(404).json({
      status: 'error',
      error: error.message || 'Not Found.',
      statusCode: 404,
    });
  else {
    if (error.isJoi) error.status = 422;

    return res.status(error.status || 500).json({
      status: 'error',
      statusCode: error.status || 500,
      error: error.message || 'Internal Server Error.',
    });
  }
});

module.exports = app;
