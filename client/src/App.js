import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Chat from './components/Chat'
import SignView from './components/SignView'
import TrainView from './components/TrainView'
import Modal from './components/Modal'


import { joinableRooms } from './api/chat'
import { listRooms } from './megablob/actions'

import _ from 'lodash'

const rooms = () => {
  console.log("calling rooms")
  joinableRooms(rooms => {
    listRooms(_.uniq(['Alexa'].concat(rooms)))
  })
}

const App = (props) => (
  <Router>
    <div className="App">
      {props.modalOpen && <Modal signModels={props.signModels}/> }
      {rooms()}
      <ul className="nav nav-pills">
        <li className="nav-item"><Link className="nav-link" to="/">Chat</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/sign">SignView</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/train">TrainView</Link></li>
      </ul>

      <hr />

      <Route exact path="/" render={() => (<Chat rooms={props.rooms} />)} />
      <Route exact path="/sign" render={() => (<SignView rooms={props.rooms} chosenModel={props.chosenModel} />)} />
      <Route exact path="/train" render={() => (<TrainView />)} />
    </div>
  </Router>
)
export default App;
