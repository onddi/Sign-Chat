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
      selectedRoomOption: { value: 'Alexa', label: 'Alexa' },
      selectedModelOption: { value: 'alexa', label: 'alexa'},
      modelNames: []
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
      'deleteMessage',
      'handleModelChange'
    )
  }

  componentDidMount() {
    axios.get('http://127.0.0.1:5000/models')
      .then(({ data }) => {
        const {models} = data
        const modelNames = models.map(s => {
          const m = _.split(s, "'")[1]
          return {value: m, label: m}
        })
        this.setState({modelNames})
      })
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
    const { selectedRoomOption } = this.state
    const { label } = selectedRoomOption

    const message = `${label}, ${msg}?`
    newMessage({ roomId: label, message })
  }

  handleRoomChange = (selectedRoomOption) => {
    this.setState({ selectedRoomOption });
    console.log(`Selected: ${selectedRoomOption.label}`);
  }

  handleModelChange = (selectedModelOption) => {
    axios.get(`http://127.0.0.1:5000/set_model?model=${selectedModelOption.value}`)
    this.setState({ selectedModelOption })
  }

  render() {
    const {
      mode,
      currentMessage,
      currentSymbol,
      currentSymbolStrength,
      messageToBeSent,
      selectedRoomOption,
      selectedModelOption,
      modelNames
    } = this.state

    const rooms = this.props.rooms && this.props.rooms.map((s, i) => ({value: s, label: s}))
    const currentMessageList = currentMessage.map((s,i) => <div key={i}><span>{s}</span></div>)

    const value = selectedRoomOption && selectedRoomOption.value;
    const symbolStrength = _.isUndefined(currentSymbolStrength) ? 0 : currentSymbolStrength
    const phrase = _.join(_.filter(currentMessage, c => c !== " "), " ")

    const modelValue = selectedModelOption && selectedModelOption.value

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

            <br />

            <div>
              <h4>What model to use</h4>
              <Select
                className=""
                name="form-field-name"
                value={modelValue}
                onChange={this.handleModelChange}
                options={modelNames}
              />
            </div>

            <br />

            <div>
              <h4>Send to room</h4>
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
