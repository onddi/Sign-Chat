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

    this.updateCurrentIndex = this.updateCurrentIndex.bind(this)
  }

  componentDidMount() {
    const list = document.getElementById('item-list')
    const childWidths = Array.from(list.children).map(c => c.getBoundingClientRect().width)

    this.setState({childWidths})

    let el = document.querySelector('.fullscreen-modal');
    el.classList.add('visible');
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
    e.stopPropagation()
    const {currentIndex, childWidths} = this.state
    const {signModels} = this.props
    const maxIndex = signModels.length - 1
    const minIndex = 0
    const updatedIndex = _.clamp(currentIndex + delta, minIndex, maxIndex)
    const targetOffset = _.sum(_.take(childWidths, updatedIndex))
    this.scrollTo(targetOffset)
  }

  pickModel(e, model) {
    e.preventDefault()
    e.stopPropagation()

    chooseModel(model)
    toggleModal(false)
  }


  render() {
    const {currentIndex} = this.state
    const {signModels} = this.props
    const currentModel = signModels[currentIndex].value

    const renderModels = signModels.map((s, i) => <span key={i}
                                                  onClick={(e) => this.pickModel(e, s.value)}
                                                  className={currentIndex === i ? 'current' : ''}>{s.value}</span>)

    return (
      <div className="fullscreen-modal" onClick={(e) => this.pickModel(e, currentModel)}>
        <button type="button"
                onClick={() => toggleModal(false)}
                className="btn btn-lg btn-danger close-modal-btn">Close</button>

        <button type="button"
                onClick={(e) => this.changeIndex(e, -1)}
                className="btn btn-lg btn-primary index-modal-btn">Prev</button>

        <button type="button"
                onClick={(e) => this.changeIndex(e, 1)}
                className="btn btn-lg btn-primary index-modal-btn next">Next</button>

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
