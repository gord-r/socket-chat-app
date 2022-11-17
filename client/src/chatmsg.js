import React from "react";
import "./App.css";
import { useEffect, useState } from "react";
import { Container } from "@mui/material";
const ChatMsg = (props) => {
  let msg = props.msg;

  const [style, setStyle] = useState({
    backgroundColor: msg.colour,
    borderRadius: 5,
    alignItems: "left",
  });

  useEffect(() => {
    if (msg.userName === props.me)
      setStyle({
        backgroundColor: msg.colour,
        borderRadius: 5,
        textAlign: "right",
        alignItems: "right",
      });
  }, []);

  // display: flex;
  // align-items: center;
  // flex-direction: column;
  // margin-top: 2em;

  return (
    <div className="scenario-message" style={style}>
      [{msg.timestamp}] {msg.userName}
      <br />
      {msg.message}
    </div>
  );
};
export default ChatMsg;
