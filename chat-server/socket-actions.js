getRooms = (io) => {
  const {rooms} = io.sockets.adapter
  return Object.keys(rooms).filter(room => !rooms[room].sockets.hasOwnProperty(room))
}

joinRoom = (socket, roomId) => {
  socket.join(roomId)
}

leaveRoom = (io, socket, roomId) => {
  const {rooms} = io.sockets.adapter
  const lastSocketToLeave = rooms[roomId] && rooms[roomId].length === 1
  socket.leave(roomId)
  // In case this is the last socket of the room, delete the room
  if(lastSocketToLeave) {
    console.log("Last socket left the room, emit new channel list")
    io.sockets.emit('joinable rooms', getRooms(io));
  }
}

createRoom = (io, socket, roomId) => {
  socket.join(roomId)
  io.emit('joinable rooms', getRooms(io))
}

sendMessage = (io, socket, roomId, message) => {
  const date = new Date(Date.now())
  const addZeros = (unit) => ('0' + unit).slice(-2) //otherwise time could be 12:8:56 (-> 12:08:56)
  const time = `${addZeros(date.getHours())}:${addZeros(date.getMinutes())}:${addZeros(date.getSeconds())}`

  io.in(roomId).emit('message', {user: socket.id, message, time}); // emit to all including the sender
  //socket.broadcast.to(roomId).emit('message', {user: socket.id, message, time}); // broadcast to all cept the sender
}

sendTranscript = (io, transcript) => {
  io.emit('transcript', transcript)
}

module.exports = {
  getRooms,
  joinRoom,
  leaveRoom,
  createRoom,
  sendMessage,
  sendTranscript
}
