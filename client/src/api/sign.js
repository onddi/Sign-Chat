import axios from 'axios'
import openSocket from 'socket.io-client';

import { ACTIONS } from '../enums/enums'

const baseUri = 'http://127.0.0.1:5000'
const socket = openSocket(baseUri);

const trainSign = ({model, sign}) => {
  socket.emit(ACTIONS.TRAIN_SIGN, {model, sign})
}

const startedTraining = cb => {
  socket.on(ACTIONS.TRAIN_START, v => cb(v))
}

const inprogressTraining = cb => {
  socket.on(ACTIONS.TRAIN_INPROGRESS, v => cb(v))
}

const finishedTraining = cb => {
  socket.on(ACTIONS.TRAIN_DONE, v => cb(v))
}

const errorTraining = cb => {
  socket.on(ACTIONS.TRAIN_ERROR, v => cb(v))
}

const startSignReading = () => {
  socket.emit(ACTIONS.SIGN_START)
}

const stopSignReading = () => {
  //socket.emit(ACTIONS.SIGN_STOP)
  return axios.get(`${baseUri}/stop`)
}

const listenToSigns = cb => {
  socket.on(ACTIONS.SIGN_PREDICTION, v => cb(v))
}

const listenToGestures = cb => {
  socket.on(ACTIONS.GESTURE, v => cb(v))
}

const getSignModels = () => {
  return axios.get(`${baseUri}/models`)
}

const getModelSigns = (model) => {
  return axios.get(`${baseUri}/models/${model}`)
}

const setCurrentSignModel = (chosenModel) => {
  return axios.get(`${baseUri}/set_model?model=${chosenModel}`)
}

export {
  trainSign,
  startedTraining,
  inprogressTraining,
  finishedTraining,
  errorTraining,
  startSignReading,
  stopSignReading,
  listenToSigns,
  listenToGestures,
  getSignModels,
  setCurrentSignModel,
  getModelSigns
}
