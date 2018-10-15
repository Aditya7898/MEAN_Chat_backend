module.exports = function(io) {
  io.on('connection', socket => {
    console.log('user connected');
    socket.on('refresh', data => {
      io.emit('refreshPage', {});
    });
  });
};
