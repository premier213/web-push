import Pusher from "pusher-js";
import { pushInstance } from "./config";

const pusherKey = "56d56355b6cc996b754bab712e42aae6";
const pusherCluster = "mt1";
const pusherHost = "socket.tjmkk.com";
const pusherPort = 6002;

export const pusher = new Pusher(pusherKey, {
  cluster: pusherCluster,
  httpHost: pusherHost,
  httpPort: Number(pusherPort),
  wsHost: pusherHost,
  wsPort: Number(pusherPort),
  authorizer: (channel) => ({
    authorize: (socketId, callback) => {
      pushInstance
        .post("/broadcasting/auth", {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((response) => callback(null, response.data))
        .catch((error) => callback(new Error("Error occurred"), error));
    },
  }),
});
