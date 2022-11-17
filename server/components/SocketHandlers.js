const moment = require("moment");

const rooms = [];
const users = [];
const colours = [
  "#ef9a9a",
  "#e57373",
  "#ef5350",
  "#f44336",
  "#e53935",
  "#d32f2f",
  "#c62828",
  "#b71c1c",
  "#ff8a80",
  "#ff5252",
  "#ff1744",
  "#d50000",
  "#f48fb1",
  "#f06292",
  "#ec407a",
  "#e91e63",
  "#d81b60",
  "#c2185b",
  "#ad1457",
  "#880e4f",
  "#ff80ab",
  "#ff4081",
  "#f50057",
  "#c51162",
  "#ce93d8",
  "#ba68c8",
  "#ab47bc",
  "#9c27b0",
  "#8e24aa",
  "#7b1fa2",
  "#6a1b9a",
  "#4a148c",
  "#ea80fc",
  "#e040fb",
  "#d500f9",
  "#aa00ff",
  "#9575cd",
  "#7e57c2",
  "#673ab7",
  "#5e35b1",
  "#512da8",
  "#4527a0",
  "#311b92",
  "#7c4dff",
  "#651fff",
  "#6200ea",
  "#7986cb",
  "#5c6bc0",
  "#3f51b5",
  "#3949ab",
  "#303f9f",
  "#283593",
  "#1a237e",
  "#536dfe",
  "#3d5afe",
  "#304ffe",
  "#42a5f5",
  "#2196f3",
  "#1e88e5",
  "#1976d2",
  "#1565c0",
  "#0d47a1",
  "#448aff",
  "#2979ff",
  "#2962ff",
  "#4fc3f7",
  "#29b6f6",
  "#03a9f4",
  "#039be5",
  "#0288d1",
  "#0277bd",
  "#01579b",
  "#00b0ff",
  "#0091ea",
  "#26c6da",
  "#00bcd4",
  "#00acc1",
  "#0097a7",
  "#00838f",
  "#006064",
  "#4db6ac",
  "#26a69a",
  "#009688",
  "#00897b",
  "#00796b",
  "#00695c",
  "#004d40",
  "#4caf50",
  "#43a047",
  "#388e3c",
  "#2e7d32",
  "#1b5e20",
  "#7cb342",
  "#689f38",
  "#558b2f",
  "#33691e",
  "#ff8f00",
  "#ff6f00",
];

const systemHex = "#a1a1a1";

const usernameColorPairs = [];

const getRooms = () => {
  let allrooms = rooms.map((room) => ({
    roomName: room.roomName,
    userCount: room.users.length,
  }));
  console.log(allrooms);
  return allrooms;
};

const handleJoin = async (socket, io, client) => {
  //ck if room exists already
  let roomExists = rooms.find((room) => room.roomName === client.roomName);

  //room exists. check if user by that name exists. if it does, emit nameexists and return
  if (roomExists) {
    let userExists = roomExists.users.find(
      (user) => user.userName === client.chatName
    );
    //user exxists
    if (userExists) {
      socket.emit("nameexists", `username in use`);
      return;
    } else {
      //room exists but user doesn't
      roomExists.users.push({ id: socket.id, userName: client.chatName });
      users.push({
        id: socket.id,
        userName: client.chatName,
        rooms: [client.roomName],
      });
    }
  }
  //room doesn't exist. make new room and add user
  else {
    rooms.push({
      roomName: client.roomName,
      users: [{ id: socket.id, userName: client.chatName }],
    });
    users.push({
      id: socket.id,
      userName: client.chatName,
      rooms: [client.roomName],
    });
  }
  socket.join(client.roomName);
  //socket.emit("welcome", `welcome ${client.chatName}`);

  let colorIndex = Math.floor(Math.random() * colours.length);
  usernameColorPairs.push({
    username: client.chatName,
    colorHex: colours[colorIndex],
  });
  let colorHex = colours[colorIndex];
  colours.splice(colorIndex, 1);

  let timestamp = moment().format("h:mm:ss a");
  let user = "system";
  let allSockets = await io.in(client.roomName).fetchSockets();
  io.to(client.roomName).emit("someonejoined", {
    timestamp: timestamp,
    userName: user,
    message: `${client.chatName} joined the room`,
    colour: systemHex,
  });

  // let allrooms = io.of("/").adapter.rooms;
  // console.log(allrooms);
  getUsersAndRooms(socket, io, client);
};

const getUsersAndRooms = async (socket, io, client) => {
  io.emit("getusers", users);
};

const handleLeave = async (socket, io, client) => {
  const [userId] = socket.rooms; //destructuring assignment - the first "room" is just the user id

  //we don't actually have the username at the time of disconnect. have to use the ID that came up
  //from the event and work backwords to find a name that matches that ID.
  //we use this name in the disconnect message that gets sent to all rooms that user was in
  let timestamp = moment().format("h:mm:ss a");
  let userName;
  rooms.forEach((room) => {
    room.users.forEach((user) => {
      if (user.id === userId) {
        userName = user.userName;
      }
    });

    let msgObject = {
      timestamp: timestamp,
      userName: "system",
      message: `${userName} left the ${room.roomName} room`,
      colour: systemHex,
    };
    io.to(room.roomName).emit("someoneleft", msgObject);
  });

  for (let i = 0; i < users.length; i++) {
    if (users[i].id === userId) {
      users.splice(i, 1);
    }
  }
  getUsersAndRooms(socket, io, client);
};

const handleTyping = async (socket, io, client) => {
  let userName = client.from.toString();
  let roomName = client.roomName.toString();

  socket.to(roomName).emit("someoneistyping", {
    from: userName,
    text: `${userName} is typing...`,
  });
};

const handleMessage = async (socket, io, client) => {
  let text = client.text;
  let userName = client.from;
  let room = client.roomName;
  let timestamp = moment().format("h:mm:ss a");

  let fullMsg = "[" + timestamp + "] " + userName + ": " + text;

  let userColourPair = usernameColorPairs.find(
    (pair) => pair.username === userName
  );
  let userHex = userColourPair.colorHex;
  io.to(room).emit("newmessage", {
    timestamp: timestamp,
    userName: userName,
    message: text,
    colour: userHex,
  });
};

module.exports = {
  getRooms,
  handleJoin,
  handleLeave,
  handleTyping,
  handleMessage,
  getUsersAndRooms,
};
