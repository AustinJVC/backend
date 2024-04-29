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

  socket.on('start-game', (roomCode) => {
    console.log("Starting Room: " + roomCode);
    rooms[roomCode].gameState = 'started';
    io.to(roomCode).emit('starting-game', rooms[roomCode].gameState)

  });

  socket.on('end-game', (roomCode) => {
    console.log("Ending Room: " + roomCode);
    io.to(roomCode).emit('ending-game');
    rooms[roomCode].gameState = null;

    io.to(roomCode).emit('ending-game')

  });

  socket.on('send-message', (roomCode, messageContent, sender) => {
    const message ={
      messageContent: messageContent,
      sender: sender,
    }
    console.log("Received Message: " + messageContent);
    console.log("From: " + sender);
    rooms[roomCode].messages.push(message)

    io.to(roomCode).emit('message-update', rooms[roomCode].messages)
    
  });

  socket.on('join-room', (userName, roomCode) => {
    const user ={
      userName, 
      id: socket.id,
    }
    
    users.push(user);
    socket.join(roomCode)

    rooms[roomCode].users += 1;
    rooms[roomCode].userList.push(user);

    io.to(roomCode).emit('successful-join', roomCode, user.userName, rooms[roomCode].users, rooms[roomCode].userList, rooms[roomCode].gameState)



    printConsoleLogs(userName, socket.id, roomCode);
  });

  socket.on('create-room', async (userName) => {
    const user ={
      userName, 
      id: socket.id,
    }
    users.push(user);
    const roomCode = await generateRoomCode();
    rooms[roomCode] = { users: 1, createdAt: Date.now(), userList: [], gameState: 'lobby', messages: []};
    socket.join(roomCode);
    rooms[roomCode].userList.push(user);
    
    io.to(roomCode).emit('successful-join', roomCode, user.userName, rooms[roomCode].users, rooms[roomCode].userList, rooms[roomCode].gameState)


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
  const data = await response.json();  // Await and store the parsed JSON data
  return data[0].toString();
}
// Start the server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});