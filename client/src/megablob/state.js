import Bacon from 'baconjs'

import {
  testAction,
  listRooms,
  toggleModal,
  signModels,
  chooseModel,
  modalGestures
} from './actions'

export default (initialState = {}) => {
  console.log(initialState)
  return Bacon.combineTemplate({
    testState: testAction.$.toProperty(initialState.testState),
    rooms: listRooms.$.map(r => r).toProperty(initialState.rooms),
    modalOpen: toggleModal.$.toProperty(initialState.modalOpen),
    signModels: signModels.$.map(r => r).toProperty(initialState.signModels),
    chosenModel: chooseModel.$.toProperty(initialState.chosenModel),
    modalGesture: modalGestures.$.toProperty(initialState.modalGesture)
  })
}
