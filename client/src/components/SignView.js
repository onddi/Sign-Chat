import React, {Component} from 'react';
import axios from 'axios'
import Leap from 'leapjs'
import _ from 'lodash'
import {newMessage} from '../api/chat'

const commands = {
  'a': 'What is the weather like in Helsinki',
  'b': 'Are you a computer',
  'c': 'Where is Aalto university'
}

const words = {
  'a': 'What',
  'b': 'is',
  'c': 'the',
  'd': 'weather',
  'e': 'like',
  'f': 'in',
  'g': 'Helsinki'
}

class SignView extends Component {

  constructor(props){
    super(props)

    this.state = {
      signs: [],
      mode: false,
      currentMessage: [],
      currentSymbol: ''
    }

    this.interpretSign = this.interpretSign.bind(this)
    this.toggleMode = this.toggleMode.bind(this)
    this.getSign = this.getSign.bind(this)

    this.mockSign = this.mockSign.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
  }

  componentWillUnmount(){
    clearInterval(this.interval)
  }

  interpretSign({symbol}){
    const {signs, currentMessage} = this.state
    const numOfSigns = 5

    const reduced = _.reduce(_.takeRight(signs, numOfSigns), (result, value, key) => result === value ? result : '') //Sign shoud be showed numOfSigns times
    const newSign = reduced !== _.last(currentMessage)

    this.setState({
      signs: signs.concat(symbol),
      currentMessage: newSign ? currentMessage.concat(reduced) : currentMessage,
      currentSymbol: symbol
    })
  }

  toggleMode(){
    console.log(this.state.mode)
    this.setState({mode: !this.state.mode}, () => this.getSign())
  }

  pollSign() {
    return axios.get('http://127.0.0.1:5000/current')
      .then(({data}) => {
        console.log(data)
        this.interpretSign(data)
      })
  }

  getSign() {
    console.log(this.state.mode)
    if(this.state.mode){
      this.interval = window.setInterval(() => this.pollSign(), 100);
    } else {
      clearInterval(this.interval)
    }
  }

  mockSign(key) {
    const {currentSymbol, currentMessage} = this.state
    const chosenCommand = _.sample(commands)
    const chosenWord = _.sample(words)

    this.setState({
      currentSymbol: chosenCommand,
      currentMessage: currentMessage.concat(chosenWord)
    })

    this.sendMessage(chosenCommand)

    //if(currentMessage.length > 6) this.sendMessage(_.map(words).join(' '))
  }

  sendMessage(msg) {
    const firstRoom = _.head(this.props.rooms)
    const message = `Alexa, ${msg}?`
    newMessage({roomId: firstRoom, message})
  }

  render() {
    const {signs, mode, currentMessage, currentSymbol} = this.state
    const signList = signs.map((s, i) => <span key={i}>{s}</span>)
    const currentMessageList = currentMessage.map((s,i) => <span key={i}>{s}</span>)
    //<div style={{width: '100%'}}>{signList}</div>

    return (
      <React.Fragment>
        <h1>SignView</h1>
        {this.props.rooms && this.props.rooms.map((s, i) => <a key={i}>{s}</a>)}
        <div style={{width: '100%'}}>{currentMessageList}</div>
        <div>{currentSymbol}</div>
        <button onClick={this.toggleMode}>{mode ? 'Stop' : 'Start'}</button>
        <button onClick={() => this.mockSign()}>Wut</button>
      </React.Fragment>
    )
  }
}

export default SignView;
