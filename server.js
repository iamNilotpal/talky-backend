const http = require('http');
require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT || 8000;
const startMongoDB = require('./mongodb.connection');

const server = http.createServer(app);
async function startServer() {
  try {
    await startMongoDB(server);
    server.listen(PORT, () =>
      console.log(`🚀🚀🚀 Server Running On http://localhost:${PORT}`),
    );
  } catch (error) {
    console.log(error);
  }
}

startServer();
module.exports = server;
