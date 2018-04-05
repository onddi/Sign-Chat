import React, { Component } from 'react';
import { Transition } from 'react-transition-group'

const duration = 500;

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
  padding: 20,
  display: 'inline-block',
  //backgroundColor: '#8787d8',
  fontSize: '5em'
}

const transitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
};



const Fade = ({ in: inProp, exited, entered, text }) => (
  <Transition in={inProp} timeout={{ enter: 100, exit: 300 }} onExited={exited} onEntered={entered} appear={true}>
    {(state) => (
      <div style={{
        ...defaultStyle,
        ...transitionStyles[state]
      }}>
        {text}
      </div>
    )}
  </Transition>
);

class Message extends Component {

  constructor(props) {
    super(props)

    this.state = {
      show: true,
      messages: [],
      currentMessage: ''
    };

    this.addMessage = this.addMessage.bind(this)
    this.entered = this.entered.bind(this)
    this.exited = this.exited.bind(this)
  }

  componentDidMount() {
    const { messages } = this.state
    const currentMessage = messages[messages.length - 1]

    this.setState({
      messages: messages.slice(0, -1),
      currentMessage: currentMessage
    })
  }

  componentWillUpdate(nextProps, nextState) {
    const { messages, show } = this.state
    if (messages.length === 0 && show === false && nextState.messages.length > 0) {
      console.log("Run exited with", nextState.messages)
      this.exited(nextState.messages)
    }
  }

  addMessage() {
    const elems = ['Hei', 'Oletko', 'Kesäinen', 'Ilta', 'Minä', 'En', 'Tosissani', 'Turhaan']
    const newElem = elems[Math.floor(Math.random() * elems.length)]
    console.log("Messages now", this.state.messages)
    this.setState({ messages: this.state.messages.concat(newElem) })
  }

  entered() {
    setTimeout(() => this.setState({ show: false }), 2000)
  }

  exited(messages) {
    if (messages.length < 1) return
    const currentMessage = messages[messages.length - 1]

    setTimeout(() => {
      this.setState({
        messages: messages.slice(0, -1),
        currentMessage: currentMessage,
        show: true
      })
    }, 200)
  }

  render() {
    const { show, currentMessage, messages } = this.state

    return (
      <React.Fragment>
        <Fade in={!!show} exited={() => this.exited(messages)} entered={this.entered} text={currentMessage} />
        <br />
        <button className='btn' onClick={this.addMessage}>Add message</button>
      </React.Fragment>
    )
  }
}

export default Message;
