import openSocket from 'socket.io-client';

import { ACTIONS } from '../enums/enums'

const socket = openSocket('http://127.0.0.1:5000');

const trainSign = ({model, sign}) => {
  socket.emit('train_sign', {model, sign})
}

const startedTraining = cb => {
  socket.on(ACTIONS.START, v => cb(v))
}

const inprogressTraining = cb => {
  socket.on(ACTIONS.INPROGRESS, v => cb(v))
}

const finishedTraining = cb => {
  socket.on(ACTIONS.DONE, v => cb(v))
}

const errorTraining = cb => {
  socket.on(ACTIONS.ERROR, v => cb(v))
}

export { trainSign, startedTraining, inprogressTraining, finishedTraining, errorTraining }
