const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

const server = app.listen(port, () => console.log(`Listening on port ${port}`));
const io = require('socket.io')(server);

//REST API//

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

//Socket IO//

getRooms = (io) => {
  const {rooms} = io.sockets.adapter
  return Object.keys(rooms).filter(room => !rooms[room].sockets.hasOwnProperty(room))
}

io.on('connection', function(socket) {
  //Emit the joinable rooms to the socket
  socket.emit('joinable rooms', getRooms(io))

  socket.on('join room', roomId => { socket.join(roomId) })
  socket.on('leave room', roomId => { socket.leave(roomId) })

  socket.on('create room', roomId => {
    socket.join(roomId)
    io.emit('joinable rooms', getRooms(io))
  })

  socket.on('new message', ({roomId, message}) => {
    const date = new Date(Date.now())
    const addZeros = (unit) => ('0' + unit).slice(-2) //otherwise time could be 12:8:56 (-> 12:08:56)
    const time = `${addZeros(date.getHours())}:${addZeros(date.getMinutes())}:${addZeros(date.getSeconds())}`
    io.in(roomId).emit('message', {user: socket.id, message, time}); // emit to all including the sender
    //socket.broadcast.to(roomId).emit('message', {user: socket.id, message, time}); // broadcast to all cept the sender
  })

})
