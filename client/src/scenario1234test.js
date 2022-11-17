import { useReducer, useEffect } from "react";
import io from "socket.io-client";
import { ThemeProvider } from "@mui/material/styles";
import { Button, TextField, Typography, AppBar, Toolbar } from "@mui/material";
import theme from "./theme";
const Scenario1234Test = () => {
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
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);
  useEffect(() => {
    serverConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const serverConnect = () => {
    // connect to server
    const socket = io.connect("localhost:5000", {
      forceNew: true,
      transports: ["websocket"],
      autoConnect: true,
      reconnection: false,
      timeout: 5000,
    });
    socket.on("nameexists", onExists);
    socket.on("welcome", addMessage);
    socket.on("someonejoined", addMessage);
    socket.on("someoneleft", addMessage);
    socket.on("someoneistyping", onTyping);
    socket.on("newmessage", onNewMessage);

    setState({ socket: socket });
  };
  const onExists = (dataFromServer) => {
    setState({ status: dataFromServer });
  };

  const onNewMessage = (dataFromServer) => {
    addMessage(dataFromServer);
    setState({ typingMsg: "" });
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
    setState({ roomName: e.target.value });
  };

  // keypress handler for message TextField
  const onMessageChange = (e) => {
    setState({ message: e.target.value });
    if (state.isTyping === false) {
      state.socket.emit(
        "typing",
        { from: state.chatName, roomName: state.roomName },
        (err) => {}
      );
      setState({ isTyping: true }); // flag first byte only
    }
  };

  // enter key handler to send message
  const handleSendMessage = (e) => {
    if (state.message !== "") {
      state.socket.emit(
        "message",
        { from: state.chatName, text: state.message, roomName: state.roomName },
        (err) => {}
      );
      setState({ isTyping: false, message: "" });
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            INFO3139 - Socket IO
          </Typography>
        </Toolbar>
      </AppBar>
      <h3 style={{ textAlign: "center" }}>Scenario 1,2,3 Tests</h3>
      {state.showjoinfields && (
        <div style={{ padding: "3vw", margin: "3vw" }}>
          <TextField
            onChange={onNameChange}
            placeholder="Enter unique name"
            autoFocus={true}
            required
            value={state.chatName}
            error={state.status !== ""}
            helperText={state.status}
          />
          <p></p>
          <TextField
            onChange={onRoomChange}
            placeholder="Enter room name"
            required
            value={state.roomName}
          />
          <p></p>
          <Button
            variant="contained"
            data-testid="submit"
            color="primary"
            style={{ marginLeft: "3%" }}
            onClick={() => handleJoin()}
            disabled={state.chatName === "" || state.roomName === ""}
          >
            Join
          </Button>
        </div>
      )}
      {!state.showjoinfields && (
        <div
          style={{ marginTop: "3vh", marginLeft: "2vw", fontWeight: "bold" }}
        >
          Current Messages
        </div>
      )}
      {!state.showjoinfields && (
        <TextField
          onChange={onMessageChange}
          placeholder="type something here"
          autoFocus={true}
          value={state.message}
          onKeyPress={(e) => (e.key === "Enter" ? handleSendMessage() : null)}
        />
      )}

      {state.messages.map((message, index) => (
        <Typography style={{ marginLeft: "5vw" }} key={index}>
          {message}
        </Typography>
      ))}

      <div>
        <Typography color="primary">{state.typingMsg}</Typography>
      </div>
    </div>
  );
};
export default Scenario1234Test;
