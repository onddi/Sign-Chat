import React, { Component } from 'react';
import _ from 'lodash'

import AccordionCard from './AccordionCard'

const emptyOption = { value: '', label: ''}

class TrainAccordion extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedModelOption: emptyOption,
      selectedSignOption: emptyOption,
      modelInput: '',
      signInput: ''
    }

    _.bindAll(this,
      'modelInputChange',
      'modelOptionChange',
      'signInputChange',
      'signOptionChange'
    )
  }

  modelOptionChange(selectedModelOption) {
    const selectedOption = selectedModelOption ? selectedModelOption : emptyOption
    const {value} = selectedOption

    this.props.setModel(value)
    this.props.getSigns(value)

    this.setState({
      selectedModelOption: selectedOption,
      modelInput: ''
    })
  }

  signOptionChange(selectedSignOption) {
    const selectedOption = selectedSignOption ? selectedSignOption : emptyOption
    const {value} = selectedOption

    this.props.setSign(value)

    this.setState({
      selectedSignOption: selectedOption,
      signInput: ''
    })
  }

  modelInputChange(e) {
    const {value} = e.target

    this.setState({
      modelInput: value,
      selectedModelOption: {value: '', label: ''}
    })
  }

  signInputChange(e) {
    const {value} = e.target

    this.props.setSign('')

    this.setState({
      signInput: value,
      selectedSignOption: {value: '', label: ''}
    })
  }

  render() {
    const {
      selectedModelOption,
      modelInput,
      selectedSignOption,
      signInput
    } = this.state

    const {
      modelNames,
      signNames,
      setModel,
      chosenModel,
      setSign,
      chosenSign,
      doingTraining
    } = this.props

    const modelValue = selectedModelOption && selectedModelOption.value
    const signValue = selectedSignOption && selectedSignOption.value

    const modelChosen = !chosenModel

    return (
      <div id="accordion">
        <AccordionCard  headingId="headOne"
                        heading="Model"
                        collapseId="collapseOne"
                        selectValue={modelValue}
                        selectChange={this.modelOptionChange}
                        selectOptions={modelNames}
                        inputPlaceholder="New model name"
                        inputChange={this.modelInputChange}
                        inputValue={modelInput}
                        confirm={setModel}
                        confirmed={chosenModel}
                        modelNeeded={false}
                        doingTraining={doingTraining}/>

        <AccordionCard  headingId="headTwo"
                        heading="Sign"
                        collapseId="collapseTwo"
                        selectValue={signValue}
                        selectChange={this.signOptionChange}
                        selectOptions={signNames}
                        inputPlaceholder="New sign name"
                        inputChange={this.signInputChange}
                        inputValue={signInput}
                        confirm={setSign}
                        confirmed={chosenSign}
                        modelNeeded={modelChosen}
                        doingTraining={doingTraining}/>
      </div>
    )
  }
}

export default TrainAccordion;
