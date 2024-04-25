const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {origin: "*"}
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected');
  socket.emit('successfulConnect')

  //Create room
  socket.on('createRoom', () => {
    console.log("Create room request received. Generating room code.")
    const roomCode = generateRoomCode(); //Make an API request for a random 6-letter word.
    console.log("Generating room. CODE: " + roomCode)
    if (!rooms[roomCode]) {
      // Create a new room object.
      rooms[roomCode] = { roomCode, gameState: {}, roomPlayers: {} };
      console.log(`Room ${roomCode} created`);
      socket.emit('roomCreated', roomCode); // Send roomCode to user
    } else {
      // Handle case of generating a duplicate room code (optional)
      console.log(`Room code collision detected, generating new code`);
      //socket.emit('roomCreateFailed', 'Duplicate room code'); // Inform user
      // You can call createRoom again to retry or implement backoff strategy
    }
  });  
});


async function generateRoomCode() {
  const response = await fetch("https://random-word-api.herokuapp.com/word?length=6");
  return response.json()[0].toUpperCase();
}

// Start the server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});