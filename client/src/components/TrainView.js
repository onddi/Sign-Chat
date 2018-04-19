import React, { Component } from 'react';
import _ from 'lodash'

import TrainAccordion from './TrainAccordion'

import {
  trainSign,
  startedTraining,
  inprogressTraining,
  finishedTraining,
  errorTraining,
  getSignModels,
  getModelSigns
} from '../api/sign'

class TrainView extends Component {

  constructor(props){
    super(props)

    this.state = {
      trainingText: '',
      progressValue: '0',
    }

    _.bindAll(this,
      'trainSign',
      'getSigns',
      'setModel',
      'setSign',
      'extractProgress'
    )
  }

  componentDidMount(){

    getSignModels()
      .then(({ data }) => {
        const {models} = data
        const modelNames = models.map(s => {
          const m = _.split(s, "'")[1]
          return {value: m, label: m}
        })
        this.setState({modelNames})
      })

    startedTraining(value => {
      console.log("Started", value)
      this.setState({trainingText: value, doingTraining: true, progressValue: '0'})
    })

    inprogressTraining(value => {
      console.log("In progress", value)
      this.extractProgress(value)
    })

    finishedTraining(value => {
      console.log("Finished", value)
      this.clearTrainging()
      this.setState({trainingText: 'Done training, train another sign?', progressValue: '100', doingTraining: false})
    })

    errorTraining(value => {
      console.log("Error training", value)
      this.setState({trainingText: value})
    })
  }

  extractProgress(progress) {
    const currentProgress = _.split(progress, "/")
    const valueNow = _.parseInt(_.first(currentProgress))
    const valueMax = _.parseInt(_.last(currentProgress))
    const percentage = _.toString((valueNow / valueMax) * 100)

    this.setState({progressValue: percentage})

  }

  getSigns(model) {
    getModelSigns(model)
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
    if(this.state.doingTraining) return
    trainSign({model, sign})
  }

  setModel(chosenModel) {
    console.log(chosenModel)
    this.setState({chosenModel})
  }

  setSign(chosenSign) {
    this.setState({chosenSign, trainingText: '', progressValue: '0'})
  }

  clearTrainging() {
    this.setSign(false)
  }

  render() {
    const {
      modelNames,
      signNames,
      trainingText,
      chosenModel,
      chosenSign,
      doingTraining,
      progressValue
    } = this.state

    const readyToTrain = chosenSign && chosenModel
    const buttonStyle = readyToTrain ? 'btn-success' : 'btn-secondary'

    const progressDone = progressValue === '100' ? 'bg-success' : 'progress-bar-striped'

    return (
      <div className="container">
        <TrainAccordion modelNames={modelNames}
                        setModel={this.setModel}
                        signNames={signNames}
                        getSigns={this.getSigns}
                        setSign={this.setSign}
                        chosenModel={chosenModel}
                        chosenSign={chosenSign}
                        doingTraining={doingTraining}/>

        <br />

        <button type="button"
                className={`btn btn-lg btn-block btn-training ${buttonStyle}`}
                onClick={() => this.trainSign(chosenModel, chosenSign)}
                disabled={!readyToTrain || doingTraining}>{doingTraining ? 'Training...' : 'Start'}</button>

        <br />
          <h4 style={{textAlign: 'center'}}>{trainingText}</h4>
        <br />

        <div className="progress" style={{height: '40px'}}>
          <div className={`progress-bar progress-bar-animated ${progressDone}`} role="progressbar" aria-valuenow={progressValue} aria-valuemin="0" aria-valuemax="100" style={{width: `${progressValue}%`}}></div>
        </div>

      </div>
    );
  }
}

export default TrainView;
