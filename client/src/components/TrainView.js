import React, { Component } from 'react';
import axios from 'axios'
import _ from 'lodash'

import TrainAccordion from './TrainAccordion'

import {
  trainSign,
  startedTraining,
  inprogressTraining,
  finishedTraining,
  errorTraining
} from '../api/sign'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { ACTIONS } from '../enums/enums'

class TrainView extends Component {

  constructor(props){
    super(props)

    this.state = {
      trainingProgress: ''
    }

    _.bindAll(this,
      'trainSign',
      'getModels',
      'getSigns',
      'trainModel',
      'setModel',
      'setSign'
    )
  }

  componentDidMount(){

    this.getModels()

    startedTraining(value => {
      console.log("Started", value)
      this.setState({trainingProgress: value})
    })

    inprogressTraining(value => {
      console.log("In progress", value)
      this.setState({trainingProgress: value})
    })

    finishedTraining(value => {
      console.log("Finished", value)
      this.setState({trainingProgress: value})
    })

    errorTraining(value => {
      console.log("Error training", value)
      this.setState({trainingProgress: value})
    })
  }

  getModels() {
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

  getSigns(model) {
    axios.get(`http://127.0.0.1:5000/models/${model}`)
      .then(({ data }) => {
        console.log(data)
        const signNames = data.map(s => {
          const sign = s['sign']
          return {value: sign, label: sign}
        })
        this.setState({signNames})
      })
  }

  trainSign(model, sign) {
    trainSign({model, sign})
  }

  trainModel() {
    axios.get(`http://127.0.0.1:5000/train_model?model=${this.state.modelInputValue}`)
      .then(({data}) => {
        console.log(data)
      })
  }

  setModel(chosenModel) {
    console.log(chosenModel)
    this.setState({chosenModel})
  }

  setSign(chosenSign) {
    this.setState({chosenSign})
  }

  render() {
    const {
      modelNames,
      signNames,
      trainingProgress,
      chosenModel,
      chosenSign
    } = this.state

    const readyToTrain = chosenSign && chosenModel
    const buttonStyle = readyToTrain ? 'btn-success' : 'btn-secondary'

    return (
      <div>
        <h1>Training signs for models</h1>

        <TrainAccordion modelNames={modelNames}
                        setModel={this.setModel}
                        signNames={signNames}
                        getSigns={this.getSigns}
                        setSign={this.setSign}
                        chosenModel={chosenModel}
                        chosenSign={chosenSign}/>

        <h4>{trainingProgress}</h4>
        <button type="button"
                className={`btn btn-lg btn-block ${buttonStyle}`}
                onClick={() => this.trainSign(chosenModel, chosenSign)}
                disabled={!readyToTrain}>Train sign</button>
      </div>
    );
  }
}

export default TrainView;
