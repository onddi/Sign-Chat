import {createAction} from 'megablob'

const testAction  = createAction()
const listRooms = createAction()
const toggleModal = createAction()
const signModels = createAction()
const chooseModel = createAction()
const modalGestures = createAction()

export {
  testAction,
  listRooms,
  toggleModal,
  signModels,
  chooseModel,
  modalGestures
}
