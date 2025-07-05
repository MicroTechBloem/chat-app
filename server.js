const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let users = new Map();

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  // User sets their username
  socket.on('set username', username => {
    users.set(socket.id, username);
    io.emit('user list', Array.from(users.values()));
    socket.emit('chat message', 'System: Welcome ' + username);
    socket.broadcast.emit('chat message', `System: ${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('chat message', msg => {
    const username = users.get(socket.id) || 'Anonymous';
    io.emit('chat message', `${username}: ${msg}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    io.emit('user list', Array.from(users.values()));
    if (username) {
      io.emit('chat message', `System: ${username} left the chat`);
    }
    console.log('User disconnected:', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
