const setupMessageSocket = require('../socket/setupMessageSocket');

const setupSocket = (server) => {
    const io = require('socket.io')(server, {
        path: '/socket.io',
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        const userID = socket.handshake.query.userID;
        const userRole = socket.handshake.query.role; // Role của người dùng
        console.log(`Người dùng kết nối với ID: ${userID}, Role: ${userRole}`);

        // Tham gia phòng role
        if (userRole) {
            socket.join(userRole.toUpperCase()); // Tham gia phòng theo role (ADMIN, MEMBER)
            console.log(`Người dùng ${userID} tham gia phòng role: ${userRole}`);
        }

        // Thiết lập sự kiện cho tin nhắn
        setupMessageSocket(socket, io);
    });

    return io;
};

module.exports = setupSocket;
