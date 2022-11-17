import { Typography, Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const FriendListItem = (props) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        borderRadius: 5,
        backgroundColor: "#e7c399",
        padding: 10,
        margin: 10,
      }}
    >
      <Avatar sx={{ marginTop: 1 }} />
      <div style={{ flexDirection: "column" }}>
        <Typography variant="h6" sx={{ marginLeft: 2 }}>
          {props.friend.userName}
        </Typography>
        <Typography sx={{ marginLeft: 2 }}>
          chatting in #{props.friend.rooms[0]}
        </Typography>
      </div>
    </div>
  );
};

export default FriendListItem;
