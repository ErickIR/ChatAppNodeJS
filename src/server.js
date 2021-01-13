const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeavesChat, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let chatsCollection;
let database;

app.use(express.static(path.join(__dirname, 'public')));

const BOT_NAME = 'Admin';

io.on('connection', (socket) => {
  socket.on('joinRoom', async ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(room);

    // Welcome current user
    socket.emit('message', formatMessage(BOT_NAME, 'Welcome to ChatApp!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(room)
      .emit('message', formatMessage(BOT_NAME, `${username} has joined the chat!`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', (newMessage) => {
    const user = getCurrentUser(socket.id);
    let message = formatMessage(user.username, newMessage, user.room);

    io.to(user.room).emit('message', message);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeavesChat(socket.id);

    if (user) {
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
      io.to(user.room).emit(
        'message',
        formatMessage(BOT_NAME, `${user.username} has left the chat!`)
      );
    }
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`SERVER RUNNING ON PORT http://localhost:${PORT}/`));
