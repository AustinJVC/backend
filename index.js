const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {origin: "*"}
});

let rooms = [];
let users = [];

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join-room', (username, roomCode) => {
    const user ={
      username, 
      id: socket.id,
    }
    
    users.push(user);
    socket.join(roomCode)

    io.to(roomCode).emit('user-joined', user);

    rooms[roomCode].users += 1;
    rooms[roomCode].userList.push(user.username);

    printConsoleLogs(username, socket.id, roomCode);
  });

  socket.on('create-room', async (username) => {
    const user ={
      username, 
      id: socket.id,
    }
    users.push(user);
    io.to(roomCode).emit('user-joined', user);
    const roomCode = await generateRoomCode();
    rooms[roomCode] = { users: 1, createdAt: Date.now(), userList: [] };
    socket.join(roomCode);
    rooms[roomCode].userList.push(user.username);

    printConsoleLogs(username, socket.id, roomCode);
  });
}); 

function printConsoleLogs(username, socketID, roomCode){
  console.log("User: " + username);
  console.log("SocketID: " + socketID);
  console.log("Roomcode: " + roomCode);

  console.log(users);
  console.log(rooms);

}

async function generateRoomCode() {
  const response = await fetch("https://random-word-api.herokuapp.com/word?length=6");
  const data = await response.json();  // Await and store the parsed JSON data
  return data[0].toString();
}
// Start the server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});