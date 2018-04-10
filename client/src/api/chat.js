import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:4000');

//socket.on('connect', () => socket.emit('room'))

const createRoom = (roomId) => {
  socket.emit('create room', roomId)
}

const joinRoom = (roomId) => {
  socket.emit('join room', roomId)
}

const newMessage = ({roomId, message}) => {
  socket.emit('new message', {roomId, message})
}

const listenForMessages = cb => {
  socket.on('message', v => cb(v))
}

const joinableRooms = (cb) => {
  socket.on('joinable rooms', v => cb(v))
}

const leaveRoom = (roomId) => {
  socket.emit('leave room', roomId)
}

export {createRoom, listenForMessages, joinRoom, newMessage, joinableRooms, leaveRoom}
