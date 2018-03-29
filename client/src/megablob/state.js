import Bacon from 'baconjs'
import _ from 'lodash'

import {
  testAction,
  listRooms
} from './actions'

export default (initialState = {}) => {
  console.log(initialState)
  return Bacon.combineTemplate({
    testState: testAction.$.toProperty(initialState.testState),
    rooms: listRooms.$.map(r => {
      console.log(r)
      return r
    }).toProperty(initialState.rooms)
  })
}
