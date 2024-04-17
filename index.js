// server.js

const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store user data including online status
const users = {};

// Socket.io
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle new user joining
  socket.on("join", (username) => {
    users[socket.id] = { username, online: true }; // Set online status to true when joining
    socket.broadcast.emit("user-joined", username);
    io.emit("user-list", getUserList()); // Send updated user list to all clients
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      users[socket.id].online = false; // Set online status to false when disconnecting
      socket.broadcast.emit("user-left", username);
      io.emit("user-list", getUserList()); // Send updated user list to all clients
      delete users[socket.id];
    }
  });

  // Handle user messages
  socket.on("user-message", (message) => {
    const username = users[socket.id].username;
    io.emit("message", { username, message });
  });

  // Function to get online users list
  const getUserList = () => {
    return Object.values(users).filter((user) => user.online).map((user) => user.username);
  };
});

app.use(express.static(path.resolve(__dirname, "./public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

server.listen(9000, () => {
  console.log("Server started on port 9000");
});
