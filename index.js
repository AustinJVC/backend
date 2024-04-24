const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Define an object to store rooms
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected');

  // Handle user creating a room
  socket.on('createRoom', () => {
    let roomCode = 'DADDY'; //Add generate random code

    if (!rooms[roomCode]) {
      // Create a new room object with initial data
      rooms[roomCode] = { roomCode, gameState: {}, roomPlayers: {} };
      socket.join(roomCode); // User joins the created room
      console.log(`Room ${roomCode} created`);
      socket.emit('roomCreated', roomCode); // Send roomCode to user
    } else {
      // Handle case of generating a duplicate room code (optional)
      console.log(`Room code collision detected, generating new code`);
      socket.emit('roomCreateFailed', 'Duplicate room code'); // Inform user
      // You can call createRoom again to retry or implement backoff strategy
    }
  });

  // ... other logic for users joining existing rooms, 
  // handling game logic, and disconnecting from rooms
});

// Start the server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});