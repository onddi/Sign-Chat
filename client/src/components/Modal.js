import React, { Component } from 'react';
import _ from 'lodash'
import '../styles/Modal.css';
import { toggleModal, chooseModel } from '../megablob/actions'

class Modal extends Component {

  constructor(props){
    super(props)

    this.state = {
      childWidths: [],
      currentIndex: 0,
      fade: false
    }

    _.bindAll(this,
      'updateCurrentIndex',
      'changeIndex',
      'handleKeyDown'
    )
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  componentDidMount() {
    const list = document.getElementById('item-list')
    const childWidths = Array.from(list.children).map(c => c.getBoundingClientRect().width)

    let el = document.querySelector('.fullscreen-modal');
    el.classList.add('visible');

    this.setState({childWidths}, () => {
      const currentModelIdx = _.findIndex(this.props.signModels, m => m === this.props.chosenModel)
      this.changeIndex(null, currentModelIdx)
    })
  }

  componentWillReceiveProps(nextProps) {
    const {modalGesture} = nextProps
    if (modalGesture === 'swipe_left') {
      this.changeIndex(null, -1)
    } else if (modalGesture === 'swipe_right') {
      this.changeIndex(null, 1)
    } else if (modalGesture === 'circle') {
      this.pickModel(null, this.props.signModels[this.state.currentIndex])
    }
  }

  handleKeyDown(event) {
    const {keyCode} = event
    if (keyCode === 37) { this.changeIndex(event, -1) }
    else if (keyCode === 39) { this.changeIndex(event, 1) }
    else if (keyCode === 13) { this.pickModel(event, this.props.signModels[this.state.currentIndex]) }
  }

  updateCurrentIndex() {
    const {childWidths} = this.state
    const scrollOffset = document.getElementById('item-list').scrollLeft

    const findIndex = _.transform(childWidths, (result, value, key) => {
      result['currentIndex'] = key
      const sum = result['sum'] - value
      if(sum < 0) return false
      result['sum'] = sum
    }, {sum: scrollOffset, currentIndex: 0});

    this.setState({currentIndex: findIndex.currentIndex})
  }

  scrollTo(offset) {
    document.getElementById('item-list').scrollLeft = offset + 1
  }

  changeIndex(e, delta){
    if(e) e.stopPropagation()

    const {currentIndex, childWidths} = this.state
    const {signModels} = this.props
    const maxIndex = signModels.length - 1
    const minIndex = 0
    const updatedIndex = _.clamp(currentIndex + delta, minIndex, maxIndex)
    const targetOffset = _.sum(_.take(childWidths, updatedIndex))

    this.scrollTo(targetOffset)
  }

  pickModel(e, model) {
    if(e) {
      e.preventDefault()
      e.stopPropagation()
    }

    chooseModel(model)
    toggleModal(false)
  }


  render() {
    const {currentIndex} = this.state
    const {signModels} = this.props
    const currentModel = signModels[currentIndex]

    const renderModels = signModels.map((m, i) => <span key={i}
                                                  onClick={(e) => this.pickModel(e, m)}
                                                  className={currentIndex === i ? 'current' : ''}>{m}</span>)

    return (
      <div id="modal" className="fullscreen-modal" onClick={(e) => this.pickModel(e, currentModel)}>
        <div className="middle-container">
          <div onScroll={this.updateCurrentIndex} id="item-list" className="item-list">
            {renderModels}
          </div>
        </div>

      </div>
    );
  }
}

export default Modal;
