import React, { useReducer, useEffect } from "react";
import io from "socket.io-client";
import { ThemeProvider } from "@mui/material/styles";
import { Button, TextField, Typography, AppBar, Toolbar, Container, Card, Box, IconButton, Dialog, Slide, List } from "@mui/material";
import theme from "./theme";
import ChatMsg from "./chatmsg";
import RoomListItem from "./components/roomlistitem";
import { flexbox, minHeight, minWidth } from "@mui/system";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import FriendListItem from "./components/friendlistitem";
import { FixedSizeList } from "react-window";
import nugget from "./nugget.gif";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Main = () => {
  const initialState = {
    messages: [],
    status: "",
    showjoinfields: true,
    alreadyexists: false,
    chatName: "",
    roomName: "",
    users: [],
    typingMsg: "",
    isTyping: false,
    message: "",
    rooms: [],
    isLoggedIn: false,
    friendsDialogOpen: false,
    friends: [],
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);
  useEffect(() => {
    serverConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const serverConnect = () => {
    // connect to server

    //for running locally
    const socket = io.connect("localhost:5000", {
      forceNew: true,
      transports: ["websocket"],
      autoConnect: true,
      reconnection: false,
      timeout: 5000,
    });

    //for deployment
    // const socket = io.connect();

    socket.on("getrooms", getRooms);
    socket.on("getusers", getUsers);
    socket.on("nameexists", onExists);
    socket.on("welcome", addMessage);
    socket.on("someonejoined", addMessage);
    socket.on("someoneleft", addMessage);
    socket.on("someoneistyping", onTyping);
    socket.on("newmessage", onNewMessage);

    setState({ socket: socket });
  };

  const getUsers = async (dataFromServer) => {
    setState({ friends: dataFromServer });
  };
  const getRooms = async (dataFromServer) => {
    setState({ rooms: dataFromServer });
  };

  const onExists = (dataFromServer) => {
    setState({ status: dataFromServer });
  };

  const onNewMessage = (dataFromServer) => {
    addMessage(dataFromServer);
    setState({ typingMsg: "", isLoggedIn: true });
  };

  const onTyping = (dataFromServer) => {
    if (dataFromServer.from !== state.chatName) {
      setState({
        typingMsg: dataFromServer.text,
      });
    }
  };

  // generic handler for all other messages:
  const addMessage = (dataFromServer) => {
    let messages = state.messages;
    messages.push(dataFromServer);
    setState({
      messages: messages,
      users: dataFromServer.users,
      showjoinfields: false,
      alreadyexists: false,
      isLoggedIn: true,
    });
  };
  // handler for join button click
  const handleJoin = () => {
    state.socket.emit("join", {
      chatName: state.chatName,
      roomName: state.roomName,
    });
  };
  // handler for name TextField entry
  const onNameChange = (e) => {
    setState({ chatName: e.target.value, status: "" });
  };
  // handler for room TextField entry
  const onRoomChange = (e) => {
    setState({
      roomName: e.target.value,
    });
  };

  // keypress handler for message TextField
  const onMessageChange = (e) => {
    setState({ message: e.target.value });
    if (state.isTyping === false) {
      state.socket.emit("typing", { from: state.chatName, roomName: state.roomName }, (err) => {});
      setState({ isTyping: true }); // flag first byte only
    }
  };

  // enter key handler to send message
  const handleSendMessage = (e) => {
    if (state.message !== "") {
      state.socket.emit("message", { from: state.chatName, text: state.message, roomName: state.roomName }, (err) => {});
      setState({ isTyping: false, message: "" });
    }
  };

  const onRoomListItemClick = (listItemData) => {
    console.log(listItemData);
    setState({
      roomName: listItemData,
    });
  };

  const onFriendsBtnClick = async () => {
    setState({ friendsDialogOpen: true });
  };
  const onFriendsDialogClose = async () => {
    setState({ friendsDialogOpen: false });
  };

  return (
    <div style={{ backgroundColor: "#f4e0d9", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ backgroundColor: "#8c2500" }}>
        <Toolbar>
          {state.roomName ? (
            <Typography variant="h6" color="inherit">
              # {state.roomName}
            </Typography>
          ) : (
            <Typography variant="h6" color="inherit">
              Welcome!
            </Typography>
          )}
          {state.isLoggedIn && (
            <IconButton
              variant="contained"
              sx={{
                position: "absolute",
                right: "5%",
                backgroundColor: "gray",
              }}
              onClick={onFriendsBtnClick}
            >
              <PersonIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      {state.friendsDialogOpen && (
        <Dialog fullScreen open={state.friendsDialogOpen} onClose={onFriendsDialogClose} TransitionComponent={Transition}>
          <AppBar sx={{ backgroundColor: "#8c2500" }}>
            <Toolbar>
              <Typography variant="h6">Friends List</Typography>
              <IconButton
                sx={{
                  position: "absolute",
                  right: "5%",
                  backgroundColor: "gray",
                }}
                onClick={onFriendsDialogClose}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <div style={{ backgroundColor: "#f4e0d9", minHeight: "100vh" }}>
            <Container sx={{ position: "absolute", top: "10%" }}>
              <Box>
                {state.friends.map((friend) => {
                  return <FriendListItem friend={friend} />;
                })}
              </Box>
            </Container>
          </div>
        </Dialog>
      )}
      {state.showjoinfields && (
        <Container>
          <Box>
            <Card variant="outlined">
              <div
                style={{
                  padding: "3vw",
                  margin: "3vw",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img src={nugget} style={{ maxWidth: 100 }} />
                </div>

                <Typography variant="h5">Sign In</Typography>
                <TextField
                  onChange={onNameChange}
                  placeholder="Enter unique name"
                  defaultValue={state.chatName}
                  autoFocus={true}
                  required
                  // value={state.chatName}
                  error={state.status !== ""}
                  helperText={state.status}
                  sx={{ minWidth: 325 }}
                />
                <p></p>
                <TextField onChange={onRoomChange} placeholder="Enter room name" required value={state.roomName} sx={{ minWidth: 325, paddingBottom: 2 }} />

                {state.rooms.map((room) => {
                  return <RoomListItem roomName={room.roomName} userCount={room.userCount} onClick={onRoomListItemClick} />;
                })}
                <p></p>
                <Button
                  variant="contained"
                  data-testid="submit"
                  color="primary"
                  style={{ marginLeft: "3%" }}
                  onClick={() => handleJoin()}
                  disabled={state.chatName === "" || state.roomName === ""}
                  sx={{ minWidth: 100, backgroundColor: "#811d00" }}
                >
                  Join
                </Button>
                <Typography sx={{ position: "absolute", right: "6%", top: "59%" }} variant="caption">
                  © Gordon Reaman 2022
                  <br /> This app works best on mobile.
                </Typography>
              </div>
            </Card>
          </Box>
        </Container>
      )}
      {/* {!state.showjoinfields && (
        <div
          style={{ marginTop: "3vh", marginLeft: "2vw", fontWeight: "bold" }}
        >
        </div>
      )} */}
      <div className="scenario-container">
        {state.messages.map((message, index) => (
          <ChatMsg me={state.chatName} msg={message} key={index} />
        ))}
      </div>

      {!state.showjoinfields && (
        <Container sx={{ position: "absolute", bottom: "3%", justifyContent: "center" }}>
          <TextField
            sx={{ minWidth: "100%" }}
            onChange={onMessageChange}
            placeholder="New message"
            autoFocus={true}
            value={state.message}
            onKeyPress={(e) => (e.key === "Enter" ? handleSendMessage() : null)}
          />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Typography variant="caption">
              © Gordon Reaman 2022
              <br /> This app works best on mobile.
            </Typography>
            <Typography color="primary" sx={{ marginLeft: 10 }}>
              {state.typingMsg}
            </Typography>
          </div>
        </Container>
      )}
    </div>
  );
};
export default Main;
