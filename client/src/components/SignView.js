import React, { Component } from 'react';
import axios from 'axios'
import Leap from 'leapjs'
import _ from 'lodash'
import { toggleModal, signModels, chooseModel } from '../megablob/actions'
import { newMessage } from '../api/chat'
import {
  startSignReading,
  stopSignReading,
  listenToSigns,
  listenToGestures
} from '../api/sign'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

class SignView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      signs: [],
      mode: false,
      currentMessage: [],
      currentSymbol: '',
      symbolToConfirm: '',
      selectedRoomOption: { value: 'Alexa', label: 'Alexa' },
      selectedModelOption: { value: 'alexa', label: 'alexa'},
      modelNames: []
    }

    _.bindAll(this,
      'interpretSign',
      'toggleMode',
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
        signModels(modelNames)
        chooseModel(_.first(modelNames).value)
        this.setState({modelNames})
      })

    listenToSigns(sign => {
      console.log(sign)
      this.interpretSign(sign)
    })

    listenToGestures(gesture => {
      console.log("GESTURE", gesture)
      if(gesture === 'swipe_left') {
        this.deleteMessage()
      } else if (gesture === 'swipe_right') {
        this.addSignToMessage(this.state.symbolToConfirm)
      } else if (gesture === 'circle') {
        this.messageEvent()
      }
    })
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);

    stopSignReading()
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

  addSignToConfirm(symbol) {
    const {symbolToConfirm} = this.state

    this.setState({ symbolToConfirm: symbol })
  }

  addSignToMessage(symbol) {
    const { currentMessage } = this.state

    const newSign = symbol !== _.last(currentMessage)
    const messages = newSign ? currentMessage.concat(symbol) : currentMessage

    this.setState({
      symbolToConfirm: '',
      currentMessage: messages,
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

  deleteMessage(){
    this.setState({
      signs: [],
      currentMessage: [],
      currentSymbol: ''
    })
  }

  interpretSign(symbol){
    const updatedStreamOfSigns = this.state.signs.concat(symbol)
    const signThresholdNum = 10
    const lastXOfStream = _.takeRight(updatedStreamOfSigns, signThresholdNum)

    const thresholdConfirmed = this.areArrayLastXElemsSame(lastXOfStream, signThresholdNum)

    //const shouldSend = _.isEqual(symbol, ACTIONS.SEND)
    //const shouldBackspace = _.isEqual(symbol, 'no')

    if(thresholdConfirmed) {
      this.addSignToConfirm(symbol)
    } else {
      this.updateSymbolStrength(lastXOfStream, symbol, signThresholdNum)
    }

    //const lastXSameSigns = _.reduce(lastXSigns, (result, value) => result === value ? result : ' ') //Sign shoud be showed numOfSigns times

  }

  toggleMode() {
    this.setState({ mode: !this.state.mode }, () => this.getSign())
  }

  getSign() {
    this.state.mode ? startSignReading() : stopSignReading()


    /*if (this.state.mode) {
      this.interval = window.setInterval(() => this.pollSign(), 100);
    } else {
      clearInterval(this.interval)
    }*/
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
      modelNames,
      symbolToConfirm
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

    console.log("CHOSEN MODEL", this.props.chosenModel)

    /*
    <Select
      className=""
      name="form-field-name"
      value={modelValue}
      onChange={this.handleModelChange}
      options={modelNames}
    />
    */

    return (
      <React.Fragment>
        <div className="row justify-content-md-center">
          <div className="col-md-6">
            <h1>SignView</h1>

            <br />

            <button type="button"
                    onClick={() => toggleModal(true)}
                    className="btn btn-lg btn-primary">Open modal</button>

            <div>
              <h4>Current model</h4>
              <h4>{this.props.chosenModel}</h4>
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

            <div>
              <h2>Symbol to confirm</h2>
              <span>{symbolToConfirm}</span>
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
