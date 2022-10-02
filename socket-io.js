const socketIO = require('socket.io');
const server = require('./server');
const SOCKET_EVENTS = require('./constants/socket-events');

const USER_MAPPING = {};
const io = socketIO(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.JOIN, ({ roomId, user }) => {
    USER_MAPPING[socket.id] = user;
    // GETTING ALL THE CLIENTS THAT ARE CONNECTED TO THE ROOM by its "roomId"
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    // NOW LOOP OVER THE CLIENTS ADD EMIT AN EVENT THAT A NEW CLIENT WANTS TO JOIN
    // ALSO EMIT AN EVENT THE CURRENT CLIENT WHO WANTS TO JOIN PASSING SOME INFO
    clients.forEach((clientId) => {
      // FOR OTHER CLIENTS
      io.to(clientId).emit(SOCKET_EVENTS.ADD_PEER, {
        peerId: socket.id,
        createOffer: false,
        remoteUser: user,
      });

      // FOR THE CURRENT CLIENT
      socket.emit(SOCKET_EVENTS.ADD_PEER, {
        peerId: clientId,
        createOffer: true,
        remoteUser: USER_MAPPING[clientId],
      });
    });

    socket.join(roomId);
  });

  // HANDLE ICECANDIDATE
  socket.on(SOCKET_EVENTS.RELAY_ICE, ({ peerId, icecandidate }) =>
    io.to(peerId).emit(SOCKET_EVENTS.ICE_CANDIDATE, {
      peerId: socket.id,
      icecandidate,
    })
  );

  // HANDLE SDP (SESSION DESCRIPTION)
  socket.on(SOCKET_EVENTS.RELAY_SDP, ({ peerId, sessionDescription }) =>
    io.to(peerId).emit(SOCKET_EVENTS.SESSION_DESCRIPTION, {
      peerId: socket.id,
      sessionDescription,
    })
  );

  const leaveRoom = ({ roomId }) => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((id) => {
      // GETTING ALL THE CLIENTS THAT ARE CONNECTED TO THE ROOM by its "roomId"
      const clients = Array.from(io.sockets.adapter.rooms.get(id) || []);
      clients.forEach((clientId) => {
        io.to(clientId).emit(SOCKET_EVENTS.REMOVE_PEER, {
          peerId: socket.id,
          userId: USER_MAPPING[socket.id]?.id,
        });

        socket.emit(SOCKET_EVENTS.REMOVE_PEER, {
          peerId: clientId,
          userId: USER_MAPPING[clientId]?.id,
        });
      });
      socket.leave(roomId);
    });
    delete USER_MAPPING[socket.id];
  };

  // HANDLE REMOVE PEER
  socket.on(SOCKET_EVENTS.LEAVE, leaveRoom);
  socket.on('disconnecting', leaveRoom);
});
