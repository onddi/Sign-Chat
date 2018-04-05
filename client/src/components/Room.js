import React, { Component } from 'react';
import { createRoom, listenForMessages, newMessage, joinRoom, joinableRooms, leaveRoom } from '../api/chat'

class Room extends Component {

  constructor(props) {
    super(props)

    this.state = {
      messages: [],
      messageInput: '',
      speech: true
    };

    this.handleMessageInput = this.handleMessageInput.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.toggleSpeech = this.toggleSpeech.bind(this);
    this.speak = this.speak.bind(this);

  }

  componentDidMount() {
    listenForMessages(value => {
      const { user, message, time } = value
      console.log("COMING FROM ROOM", this.props.selectedRoom)
      console.log("ROOM msg", user, message, time)
      this.setState({ messages: this.state.messages.concat({ user, message, time }) })
      this.speak(message);
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedRoom !== nextProps.selectedRoom) {
      this.setState({ messages: [] })
    }
  }

  componentWillUnmount() {
    console.log("Component unmounted")
  }

  speak(mumble) {
    if (this.state.speech) {
      const synth = window.speechSynthesis;
      const utterThis = new SpeechSynthesisUtterance(mumble)
      synth.speak(utterThis);
    }
  }

  toggleSpeech() {
    this.setState({ speech: !this.state.speech });
  }

  componentDidUpdate() {
    const elem = document.getElementById('messages');
    if (elem) elem.scrollIntoView(false)
  }

  handleMessageInput(event) {
    this.setState({ messageInput: event.target.value });
  }

  sendMessage() {
    newMessage({ roomId: this.props.selectedRoom, message: this.state.messageInput })
    this.setState({ messageInput: '' })
  }

  render() {
    const { messages, messageInput } = this.state
    const messageList = messages.map((d, i) => <li key={i}>[{d.time}] {d.user.substring(0, 5)}: {d.message}</li>);

    return (
      <React.Fragment>
        <div className="RoomHeader">
          <h1>Current room: {this.props.selectedRoom}</h1>
        </div>
        <div className="RoomMessages">
          <ul id="messages">{messageList}</ul>
        </div>

        <div className="input-group MessageInputArea">
          <input type="text" className="form-control" value={messageInput} onChange={this.handleMessageInput} aria-describedby="basic-addon2" />
          <div className="input-group-append">
            <button className="btn btn-outline-primary" onClick={this.sendMessage} type="button">Send</button>
            <button className="btn btn-outline-secondary" onClick={this.toggleSpeech} type="button">{this.state.speech ? 'Speech off' : 'Speech on'}</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Room;
