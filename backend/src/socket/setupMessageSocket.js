const setupMessageSocket = (socket, io) => {
    // Tham gia phòng chat
    socket.on('join-room', ({ senderId, receiverId }) => {
        socket.join(senderId + receiverId);
        console.log(`Người dùng ${senderId} đã tham gia phòng ${senderId + receiverId}`);
    });
    // Gửi tin nhắn
    socket.on('send-message', (msg) => {
        console.log(msg);
        socket.to(msg.senderId + msg.receiverId).emit('receive-message', msg);
    });

    // Gửi thông báo đến role cụ thể
    socket.on('send-notification', (type) => {
        console.log(`Gửi thông báo đến roles: ${type}`);

        if (type === 'ALL') {
            io.emit('receive-notification', 'success');
        } else {
            io.to(type).emit('receive-notification', 'success');
        }
    });
};

module.exports = setupMessageSocket;
