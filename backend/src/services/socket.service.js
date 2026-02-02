let io;

const setIo = (socketIo) => {
    io = socketIo;
};

const getIo = () => {
    return io;
};

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId.toString()).emit(event, data);
        return true;
    }
    return false;
};

const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
        return true;
    }
    return false;
};

module.exports = {
    setIo,
    getIo,
    emitToUser,
    emitToAll
};
