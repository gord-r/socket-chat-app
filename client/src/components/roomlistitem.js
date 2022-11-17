import {
  Button,
  Typography,
  Modal,
  Box,
  TextField,
  Radio,
} from "@mui/material";
import { textAlign } from "@mui/system";
import React, { useState, useEffect, useReducer } from "react";

const RoomListItem = (props) => {
  const sendClickToParent = () => {
    props.onClick(props.roomName);
  };

  return (
    <div style={{ display: "flex" }}>
      <Button
        onClick={sendClickToParent}
        variant="outlined"
        sx={{ textTransform: "none", marginBottom: 1, minWidth: 325 }}
      >
        {/* <Radio checked={isSelected} /> */}
        <Typography sx={{ minWidth: 100, textAlign: "left" }}>
          # {props.roomName}
        </Typography>
        <Typography sx={{ minWidth: 100, textAlign: "right" }}>
          {props.userCount}
        </Typography>
      </Button>
    </div>
  );
};

export default RoomListItem;
