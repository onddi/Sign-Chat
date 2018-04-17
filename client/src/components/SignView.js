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

import '../styles/SignView.css'

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
      modelNames: [],
      confirmingSign: false
    }

    _.bindAll(this,
      'interpretSign',
      'toggleMode',
      'sendMessage',
      'handleKeyDown',
      'messageEvent',
      'addSignToMessage',
      'updateSymbolStrength',
      'deleteMessage',
      'backSpace'
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

        const chosenModel = _.first(modelNames).value
        chooseModel(chosenModel)
        this.handleModelChange(chosenModel)

        this.setState({modelNames})
      })

    listenToSigns(sign => {
      console.log(sign)
      this.interpretSign(sign)
    })

    listenToGestures(gesture => {
      console.log("GESTURE", gesture)
      if(gesture === 'swipe_left') {
        //this.backSpace()
      } else if (gesture === 'swipe_right') {
        //this.addSignToMessage(this.state.symbolToConfirm)
      } else if (gesture === 'circle') {
        //this.messageEvent()
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

  componentWillReceiveProps(nextProps) {
    const {chosenModel} = nextProps
    if(this.props.chosenModel !== chosenModel) {
      this.handleModelChange(chosenModel)
    }
  }

  handleKeyDown(event) {
    const {keyCode} = event
    if (keyCode === 32) { this.toggleMode() }
    else if (keyCode === 27) { toggleModal(true) }
    else if (keyCode === 13) { this.messageEvent() }
    else if (keyCode === 38) { this.backSpace() }
    else if (keyCode === 40) { this.addSignToMessage(this.state.symbolToConfirm) }
  }

  handleModelChange = (chosenModel) => {
    axios.get(`http://127.0.0.1:5000/set_model?model=${chosenModel}`)
  }

  messageEvent() {
    const { currentMessage } = this.state
    const sentence = _.join(_.filter(currentMessage, c => c !== " "), " ")

    if (sentence.length > 0) {
      this.sendMessage(sentence)
    }
  }

  sendMessage(msg) {
    const { selectedRoomOption } = this.state
    const { label } = selectedRoomOption

    const message = `${label}, ${msg}?`
    newMessage({ roomId: label, message })

    this.setState({
      signs: [],
      currentMessage: []
    })
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

  addSignToConfirm(symbol) {
    const {symbolToConfirm} = this.state
    this.setState({
      symbolToConfirm: symbol,
      confirmingSign: true
    })
  }

  addSignToMessage(symbol) {
    const { currentMessage } = this.state

    //const newSign = symbol !== _.last(currentMessage)
    //const messages = newSign ? currentMessage.concat(symbol) : currentMessage

    this.setState({
      symbolToConfirm: '',
      currentMessage: currentMessage.concat(symbol),
      currentSymbol: symbol,
      currentSymbolStrength: 0,
      signs: [],
      confirmingSign: false
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

  backSpace(){
    const {confirmingSign, currentMessage} = this.state
    this.setState({
      currentMessage: confirmingSign ? currentMessage : _.initial(currentMessage),
      signs: [],
      symbolToConfirm: '',
      confirmingSign: false
    })
  }

  interpretSign(symbol){
    if(this.state.confirmingSign) return

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
  }

  toggleMode() {
    this.setState({ mode: !this.state.mode },
      () => this.state.mode ? startSignReading() : stopSignReading()
    )
  }

  render() {
    const {
      mode,
      currentMessage,
      currentSymbol,
      currentSymbolStrength,
      symbolToConfirm,
      confirmingSign
    } = this.state

    const symbolStrength = _.isUndefined(currentSymbolStrength) ? 0 : currentSymbolStrength
    const sentence = _.join(_.filter(currentMessage, c => c !== " "), " ")

    const modelButtonStyle = mode ? 'btn-outline-success' : 'btn-outline-secondary'

    const phraseStyle = {
      color: 'green',
      opacity: confirmingSign ? 1 : symbolStrength
    }

    return (
      <React.Fragment>
        <div className="sign-view-container">
          <div className="row justify-content-md-center">
            <div className="col-md-12">
              <div style={{ width: '100%' }}>
                <h3>
                  <button type="button" className={`btn ${modelButtonStyle}`}>{this.props.chosenModel}</button> {sentence} <span style={phraseStyle}>{confirmingSign ? symbolToConfirm : currentSymbol}</span>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default SignView;
