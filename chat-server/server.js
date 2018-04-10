const express = require('express');
const cors = require('cors')
const app = express();
const port = process.env.PORT || 4000;

const server = app.listen(port, () => console.log(`Listening on port ${port}`));
const io = require('socket.io')(server);

const s_actions = require('./socket-actions')

app.use(cors())

//REST API//

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

//Socket IO//

io.on('connection', function(socket) {
  //Emit the joinable rooms to the socket
  console.log(socket.id, "connected!")
  socket.emit('joinable rooms', s_actions.getRooms(io))
  socket.on('join room', roomId => { s_actions.joinRoom(socket, roomId)})
  socket.on('leave room', roomId => { s_actions.leaveRoom(io, socket, roomId) })
  socket.on('create room', roomId => { s_actions.createRoom(io, socket, roomId) })
  socket.on('new message', ({roomId, message}) => { s_actions.sendMessage(io, socket, roomId, message) })
  socket.on('disconnect', function () {
    console.log(socket.id, "disconnected!")
    //io.emit('user disconnected');
  });

})
