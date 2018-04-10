import React, { Component } from 'react';
import axios from 'axios'
import _ from 'lodash'

import { trainSign, startedTraining, inprogressTraining, finishedTraining, errorTraining } from '../api/sign'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

class TrainView extends Component {

  constructor(props){
    super(props)

    this.state = {
      selectedModelOption: { value: '', label: ''},
      modelInputValue: '',
      selectedSignOption: { value: '', label: ''},
      signInputValue: '',
      trainingProgress: ''
    }

    _.bindAll(this,
      'handleModelInputChange',
      'handleModelChange',
      'handleSignInputChange',
      'handleSignChange',
      'trainSign',
      'getModels',
      'getSigns'
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

  handleModelChange(selectedModelOption) {
    //this.handleModelInputChange(selectedModelOption.value)
    this.getSigns(selectedModelOption.value)
    this.setState({selectedModelOption, modelInputValue: selectedModelOption.value})
  }

  handleSignChange(selectedSignOption) {
    this.setState({selectedSignOption, signInputValue: selectedSignOption.value})
  }

  handleModelInputChange(e) {
    this.setState({modelInputValue: e.target.value, selectedModelOption: {value: '', label: ''}})
  }

  handleSignInputChange(e) {
    this.setState({signInputValue: e.target.value, selectedSignOption: {value: '', label: ''}})
  }

  trainSign() {
    const {signInputValue, modelInputValue} = this.state
    trainSign({sign: signInputValue, model: modelInputValue})
  }

  render() {
    const {
      selectedModelOption,
      modelNames,
      modelInputValue,
      selectedSignOption,
      signNames,
      signInputValue,
      trainingProgress
    } = this.state

    const modelValue = selectedModelOption && selectedModelOption.value
    const signValue = selectedSignOption && selectedSignOption.value

    return (
      <div>
        <h1>TrainView</h1>
        <div>
          <h4>Select model (or create new)</h4>
          <Select
            className=""
            name="form-field-name"
            value={modelValue}
            onChange={this.handleModelChange}
            options={modelNames}
          />
          <h5>Model to train</h5>
          <input onChange={this.handleModelInputChange} value={modelInputValue} />
        </div>
        <div>
          <h4>Select sign (or create new)</h4>
          <Select
            className=""
            name="form-field-name"
            value={signValue}
            onChange={this.handleSignChange}
            options={signNames}
          />
          <h5>Model to train</h5>
          <input onChange={this.handleSignInputChange} value={signInputValue} />
        </div>
        <button onClick={this.trainSign}>Train</button>
        <h4>{trainingProgress}</h4>
      </div>
    );
  }
}

export default TrainView;
