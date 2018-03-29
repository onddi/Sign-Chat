import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Chat from './components/Chat'
import SignView from './components/SignView'

import {joinableRooms} from './api/chat'
import {listRooms} from './megablob/actions'

const rooms = () => {
  console.log("calling rooms")
  joinableRooms(rooms => {
    listRooms(rooms)
  })
}

const App = (props) => (
  <Router>
    <div className="App">
      {props.testState}
      {rooms()}
      <ul>
        <li><Link to="/">Chat</Link></li>
        <li><Link to="/sign">SignView</Link></li>
      </ul>

      <hr/>

      <Route exact path="/" render={() => ( <Chat rooms={props.rooms}/> )} />
      <Route exact path="/sign" render={() => ( <SignView rooms={props.rooms}/> )}/>
    </div>
  </Router>
)
export default App;
