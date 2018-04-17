import React, { Component } from 'react';
import Leap from 'leapjs'
import _ from 'lodash'
import { toggleModal, signModels, chooseModel, modalGestures } from '../megablob/actions'
import { newMessage, listenForTranscript } from '../api/chat'
import {
  startSignReading,
  stopSignReading,
  listenToSigns,
  listenToGestures,
  getSignModels,
  setCurrentSignModel
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
      modelNames: [],
      confirmingSign: false
    }

    _.bindAll(this,
      'interpretSign',
      'setMode',
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
    getSignModels()
      .then(({ data }) => {
        const {models} = data
        const modelNames = models.map(s => _.split(s, "'")[1])

        signModels(modelNames)

        const chosenModel = _.first(modelNames)
        chooseModel(chosenModel)
        setCurrentSignModel(chosenModel)

        this.setState({modelNames})
      })

    listenToSigns(sign => {
      console.log(sign)
      if(this.props.modalOpen) return
      this.interpretSign(sign)
    })

    listenToGestures(gesture => {
      console.log("GESTURE", gesture)
      if(this.props.modalOpen) {
        modalGestures(gesture)
      } else {
        this.handleGestures(gesture)
      }
    })

    listenForTranscript(transcript => {
      console.log(transcript)
      this.setState({transcript})
    })
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
    stopSignReading()
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillReceiveProps(nextProps) {
    const {chosenModel} = nextProps
    if(this.props.chosenModel !== chosenModel) {
      setCurrentSignModel(chosenModel)
    }
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
      this.addSignToBeConfirmed(symbol)
    } else {
      this.updateSymbolStrength(lastXOfStream, symbol, signThresholdNum)
    }
  }

  handleGestures(gesture) {
    if(gesture === 'swipe_left') {
      this.backSpace()
    } else if (gesture === 'swipe_right') {
      this.addSignToMessage(this.state.symbolToConfirm)
    } else if (gesture === 'circle') {
      this.messageEvent()
    }
  }

  handleKeyDown(event) {
    if(this.props.modalOpen) return

    const {keyCode} = event
    if (keyCode === 32) { this.setMode(!this.state.mode) }
    else if (keyCode === 27) { this.openModal() }
    //else if (keyCode === 13) { this.messageEvent() }
    else if (keyCode === 38) { this.backSpace() }
    else if (keyCode === 40) { this.addSignToMessage(this.state.symbolToConfirm) }
  }

  setMode(modeOn) {
    this.setState({ mode: modeOn },
      () => this.state.mode ?
        startSignReading()
        : stopSignReading()
    )
  }

  openModal() {
    this.setMode(true)
    toggleModal(true)
  }

  messageEvent() {
    const { currentMessage } = this.state
    const sentence = _.join(_.filter(currentMessage, c => c !== " "), " ")

    if (sentence.length > 0) {
      this.sendMessage(sentence)
    }
  }

  sendMessage(msg) {
    const roomId = 'Alexa'
    const message = `${roomId}, ${msg}?`
    newMessage({ roomId, message })

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

  addSignToBeConfirmed(symbol) {
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
      signs: _.take(signs.concat(symbol), 20),
      currentSymbol: symbol,
      currentSymbolStrength: howManySameSymbolsInTheEnd / threshold
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

  deleteMessage(){
    this.setState({
      signs: [],
      currentMessage: [],
      currentSymbol: ''
    })
  }

  render() {
    const {
      mode,
      currentMessage,
      currentSymbol,
      currentSymbolStrength,
      symbolToConfirm,
      confirmingSign,
      transcript
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
        <div className="SignView">

          <div className="Model">
              <button type="button"
                      onClick={() => this.setMode(!mode)}
                      className={`btn ${modelButtonStyle} modelButton`}>{this.props.chosenModel}</button>
          </div>

          <div className="Sentence">
              <h3>{sentence} <span style={phraseStyle}>{confirmingSign ? symbolToConfirm : currentSymbol}</span>
              </h3>
          </div>

          <div className="Transcript">
              <h5>Transcript:</h5>
              <h3>{transcript}</h3>
          </div>

        </div>
      </React.Fragment>
    )
  }
}

export default SignView;
