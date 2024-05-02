const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {origin: "*"}
});

let rooms = [];
let users = [];
const usernameRegex = /^[a-zA-Z0-9]{1,20}$/;
const roomCodeRegex = /^[a-zA-Z]{6}$/;

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('start-game', (roomCode) => {
    console.log("Starting Room: " + roomCode);
    if (rooms[roomCode] && rooms[roomCode].gameState !== 'started') {
      rooms[roomCode].gameState = 'started';
      io.to(roomCode).emit('starting-game', rooms[roomCode].gameState);
    } else {
      io.emit('error', { message: 'Failed to start game: Invalid room or already started' });
      console.error("Failed to start game: Invalid room or already started");
    }
  });

  socket.on('end-game', (roomCode) => {
    console.log("Ending Room: " + roomCode);
    if (rooms[roomCode]) {
      io.to(roomCode).emit('ending-game');
      rooms[roomCode].gameState = null;
      io.to(roomCode).emit('ending-game');
    } else {
      io.emit('error', { message: 'Failed to end game: Invalid room' });
      console.error("Failed to end game: Invalid room");
    }

  });

  socket.on('send-message', (roomCode, messageContent, sender) => {
    if (rooms[roomCode]) {
      const message = {
        messageContent,
        sender,
      };
      console.log("Received Message: " + messageContent);
      console.log("From: " + sender);
      rooms[roomCode].messages.push(message);
      io.to(roomCode).emit('message-update', rooms[roomCode].messages);
    } else {
      io.emit('error', { message: 'Failed to send message: Invalid room' });
      console.error("Failed to send message: Invalid room");
    }
  });

  socket.on('join-room', (userName, roomCode) => {
    if (rooms[roomCode] && roomCodeRegex.test(roomCode)) {
      
      const existingUser = rooms[roomCode].userList.find(user => user.userName === userName);
  
      if (existingUser && usernameRegex.test(userName)) {
        io.emit('error', { message: 'Failed to join room: Username already in use' });
        console.error(`User ${userName} already joined room ${roomCode}`);
      } else {
        
        const user = {
          userName,
          id: socket.id,
        };
        users.push(user);
        socket.join(roomCode);
        rooms[roomCode].users++;
        rooms[roomCode].userList.push(user);
        io.to(roomCode).emit('successful-join', roomCode, user.userName, rooms[roomCode].users, rooms[roomCode].userList, rooms[roomCode].gameState);
        printConsoleLogs(userName, socket.id, roomCode);
      }
    } else {
      io.emit('error', { message: 'Failed to join room: Invalid room code' });
      console.error("Failed to join room: Invalid room code");
    }
  });

  socket.on('create-room', async (userName) => {
    
    if (!usernameRegex.test(userName)) {
      io.emit('error', { message: 'Failed to create room: Invalid username.' });
      console.error(`Invalid username format: ${userName}`);
      return; 
    }

    
    const user = {
      userName,
      id: socket.id,
    };

    const roomCode = await generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = await generateRoomCode();
    }

    rooms[roomCode] = { users: 1, createdAt: Date.now(), userList: [], gameState: 'lobby', messages: [] };
    users.push(user);
    socket.join(roomCode);
    rooms[roomCode].userList.push(user);
    io.to(roomCode).emit('successful-join', roomCode, user.userName, rooms[roomCode].users, rooms[roomCode].userList, rooms[roomCode].gameState);
    printConsoleLogs(userName, socket.id, roomCode);
  });
}); 

function printConsoleLogs(userName, socketID, roomCode){
  console.log("User: " + userName);
  console.log("SocketID: " + socketID);
  console.log("Roomcode: " + roomCode);

  console.log(users);
  console.log(rooms);

}

async function generateRoomCode() {
  const response = await fetch("https://random-word-api.herokuapp.com/word?length=6");
  const data = await response.json(); 
  return data[0].toString().toUpperCase();
}
// Start the server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});