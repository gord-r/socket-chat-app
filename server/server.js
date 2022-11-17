require("dotenv").config();
const { Console } = require("console");
const express = require("express");
const app = express();
const http = require("http");
const port = process.env.PORT || 5000;
const socketIO = require("socket.io");
const SocketHandler = require("./components/SocketHandlers");

let server = http.createServer(app);
let io = socketIO(server);

// app.enable("trust proxy");

// app.use((req, res, next) => {
//   req.secure
//     ? // request was via https, so do no special handling
//       next()
//     : // request was via http, so redirect to https
//       res.redirect("https://" + req.headers.host + req.url);
// });
app.use(express.static("public"));

app.get("/", (req, res) => res.send("<h1>Hello World From Express</h1>"));
// main socket routine

io.on("connection", (socket) => {
  socket.emit("getrooms", SocketHandler.getRooms());
  socket.on("join", (clientData) => {
    SocketHandler.handleJoin(socket, io, clientData);
    SocketHandler.getUsersAndRooms(socket, io, clientData);
  });
  socket.on("disconnecting", (clientData) => {
    SocketHandler.handleLeave(socket, io, clientData);
  });
  socket.on("disconnect", (clientData) => {
    //SocketHandler.handleLeave(socket, io, clientData);
  });
  socket.on("typing", (clientData) => {
    SocketHandler.handleTyping(socket, io, clientData);
  });
  socket.on("message", (clientData) => {
    SocketHandler.handleMessage(socket, io, clientData);
  });
});

// error handler middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});
server.listen(port, () => console.log(`starting on port ${port}`));
