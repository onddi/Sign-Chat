import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';

import {startApp} from 'megablob'
import appState from './megablob/state'
//import registerServiceWorker from './registerServiceWorker';

startApp(window.INITIAL_STATE, appState, state => {
  ReactDOM.render(<App {...state}/>, document.getElementById('root'));
})
//registerServiceWorker();
