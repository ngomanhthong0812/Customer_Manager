import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL, {
    path: "/socket.io", 
    query: {
        userID: JSON.parse(localStorage.getItem('user'))?.id,
        role: JSON.parse(localStorage.getItem('user'))?.role === 123 ? 'ADMIN' : 'MEMBER',
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

export default socket;
