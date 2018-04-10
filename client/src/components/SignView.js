import React, { Component } from 'react';
import axios from 'axios'
import Leap from 'leapjs'
import _ from 'lodash'
import { newMessage } from '../api/chat'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

const commands = {
  'a': 'What is the weather like in Helsinki',
  'b': 'Are you a computer',
  'c': 'Where is Aalto university'
}

const ACTIONS = {
  SEND: 'empty'
}

class SignView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      signs: [],
      mode: false,
      currentMessage: [],
      currentSymbol: '',
      selectedOption: { value: 'Alexa', label: 'Alexa' }
    }

    _.bindAll(this,
      'interpretSign',
      'toggleMode',
      'getSign',
      'mockSign',
      'sendMessage',
      'handleRoomChange',
      'handleKeyDown',
      'messageEvent',
      'addSignToMessage',
      'updateSymbolStrength',
      'deleteMessage'
    )
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  handleKeyDown(event) {
    if (event.keyCode === 32) { this.toggleMode() }
  }

  areArrayLastXElemsOfStr(arr, num, str) {
    const lastXOfArr = _.takeRight(arr, num)
    const howManyAreSame = _.groupBy(lastXOfArr)[_.last(lastXOfArr)].length
    return _.isEqual(_.last(lastXOfArr), str) && _.isEqual(howManyAreSame, num)
  }

  areArrayLastXElemsSame(arr, num) {
    const sameSymbolsInTheEnd = _.groupBy(arr)[_.last(arr)]
    const amountOfSameSymbols = sameSymbolsInTheEnd.length
    return _.isEqual(amountOfSameSymbols, num)
  }

  messageEvent() {
    const { currentMessage } = this.state
    const phrase = _.join(_.filter(currentMessage, c => c !== " "), " ")

    if (phrase.length > 0) {
      this.sendMessage(phrase)

      this.setState({
        signs: [],
        currentMessage: []
      })
    }
  }

  addSignToMessage(symbol) {
    const { currentMessage, signs } = this.state

    const newSign = symbol !== _.last(currentMessage)
    const messages = newSign ? currentMessage.concat(symbol) : currentMessage
    const cleanSends = _.filter(messages, c => c !== ACTIONS.SEND)

    this.setState({
      currentMessage: cleanSends,
      currentSymbol: symbol,
      currentSymbolStrength: 1
    })
  }

  updateSymbolStrength(symbols, symbol, threshold) {
    const { currentMessage, signs } = this.state
    const howManySameSymbolsInTheEnd = _.groupBy(symbols)[symbol].length

    this.setState({
      signs: signs.concat(symbol),
      currentSymbol: symbol,
      currentSymbolStrength: howManySameSymbolsInTheEnd / threshold
    })
  }

  deleteMessage(symbol){
    this.setState({
      signs: [],
      currentMessage: [],
      currentSymbol: symbol
    })
  }

  interpretSign(data){
    const {symbol} = data

    const updatedStreamOfSigns = this.state.signs.concat(symbol)
    const signThresholdNum = 5
    const lastXOfStream = _.takeRight(updatedStreamOfSigns, signThresholdNum)

    const thresholdConfirmed = this.areArrayLastXElemsSame(lastXOfStream, signThresholdNum)
    const shouldSend = _.isEqual(symbol, ACTIONS.SEND)
    const shouldBackspace = _.isEqual(symbol, 'no')

    if (thresholdConfirmed && shouldSend) {
      this.messageEvent()
    } else if(thresholdConfirmed && shouldBackspace){
      this.deleteMessage(symbol)
    } else if(thresholdConfirmed) {
      this.addSignToMessage(symbol)
    } else {
      this.updateSymbolStrength(lastXOfStream, symbol, signThresholdNum)
    }

    //const lastXSameSigns = _.reduce(lastXSigns, (result, value) => result === value ? result : ' ') //Sign shoud be showed numOfSigns times

  }

  toggleMode() {
    this.setState({ mode: !this.state.mode }, () => this.getSign())
  }

  pollSign() {
    return axios.get('http://127.0.0.1:5000/current')
      .then(({ data }) => {
        console.log(data.symbol)
        this.interpretSign(data)
      })
  }

  getSign() {
    if (this.state.mode) {
      this.interval = window.setInterval(() => this.pollSign(), 100);
    } else {
      clearInterval(this.interval)
    }
  }

  mockSign(key) {
    const { currentSymbol, currentMessage } = this.state
    const chosenCommand = _.sample(commands)

    this.setState({
      currentSymbol: chosenCommand
    })

    this.sendMessage(chosenCommand)
  }

  sendMessage(msg) {
    const { selectedOption } = this.state
    const { label } = selectedOption

    const message = `${label}, ${msg}?`
    newMessage({ roomId: label, message })
  }

  handleRoomChange = (selectedOption) => {
    this.setState({ selectedOption });
    console.log(`Selected: ${selectedOption.label}`);
  }

  render() {
    const {mode, currentMessage, currentSymbol, currentSymbolStrength, messageToBeSent, selectedOption} = this.state

    const rooms = this.props.rooms && this.props.rooms.map((s, i) => ({value: s, label: s}))
    const currentMessageList = currentMessage.map((s,i) => <div key={i}><span>{s}</span></div>)

    const value = selectedOption && selectedOption.value;
    const symbolStrength = _.isUndefined(currentSymbolStrength) ? 0 : currentSymbolStrength
    const phrase = _.join(_.filter(currentMessage, c => c !== " "), " ")

    const inputStyle = {
      width: '100%',
      height: '50px',
      fontSize: '1.5rem'
    }

    return (
      <React.Fragment>
        <div className="row justify-content-md-center">
          <div className="col-md-6">
            <h1>SignView</h1>
            <div>

              <p>Send to room</p>
              <Select
                className=""
                name="form-field-name"
                value={value}
                onChange={this.handleRoomChange}
                options={rooms}
              />
            </div>
            <br />
            <div>
              <h2>Current symbol</h2><button className="btn btn-outline-primary" onClick={this.toggleMode}>{mode ? 'Stop' : 'Start'}</button>
              <span style={{ opacity: symbolStrength }}>{currentSymbol}</span>
            </div>
            <div style={{ width: '100%' }}>
              <h2>Message to be sent</h2>
              <input style={inputStyle} value={phrase} />
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default SignView;
