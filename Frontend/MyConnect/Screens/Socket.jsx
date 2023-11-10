import { io } from "socket.io-client";
import serverURL from "./MessaginFeaturesAndScreens/ServerUrl";
const socket=io(`${serverURL}`);
export default socket;