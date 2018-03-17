import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Chat from './components/Chat'
import SignView from './components/SignView'

const App = () => (
  <Router>
    <div className="App">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/sign">SignView</Link></li>
      </ul>

      <hr/>

      <Route exact path="/" component={Chat}/>
      <Route exact path="/sign" component={SignView}/>
    </div>
  </Router>
)
export default App;
