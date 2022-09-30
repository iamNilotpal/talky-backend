const socketIO = require('socket.io');
const server = require('./server');

const io = socketIO(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log('New connection');
  console.log('ID ----> ', socket.id);
  console.log('Socket ----> ', socket);
});
