import React, { Component } from 'react';
import {
  createRoom,
  listenForMessages,
  newMessage,
  joinRoom,
  joinableRooms,
  leaveRoom,
  sendTranscript
} from '../api/chat'

const SpeechRecognition = window.webkitSpeechRecognition;


class Room extends Component {

  constructor(props) {
    super(props)

    this.state = {
      messages: [],
      messageInput: '',
      speech: false,
      transcript: ''
    };

    this.handleMessageInput = this.handleMessageInput.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.toggleSpeech = this.toggleSpeech.bind(this);
    this.speak = this.speak.bind(this);
  }

  componentDidMount() {
    console.log("ROOM MOUNTED", this.props.selectedRoom)
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

  afterSpeak() {
    var recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start()

    recognition.onresult = (event) => {
      console.log(event.results[0][0].transcript)
      this.setState({ transcript: event.results[0][0].transcript })

      sendTranscript(event.results[0][0].transcript )
    }
  }

  speak(mumble) {
    if (this.state.speech) {
      const synth = window.speechSynthesis;
      const utterThis = new SpeechSynthesisUtterance(mumble)
      utterThis.onend = () => { this.afterSpeak() };
      utterThis.lang = 'en-US';
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

    /*
      <div className="RoomHeader">
        <h1>Current room: {this.props.selectedRoom}</h1>
      </div>
    */

    return (
      <React.Fragment>
        <div className="RoomMessages">
          <ul id="messages">{messageList}</ul>
        </div>

        <div className="input-group MessageInputArea">
          <input type="text" className="form-control" value={messageInput} onChange={this.handleMessageInput} aria-describedby="basic-addon2" />
          <div className="input-group-append">
            <button className="btn btn-outline-primary" onClick={this.sendMessage} type="button">Send</button>
            <button className="btn btn-outline-secondary" onClick={this.toggleSpeech} type="button">{this.state.speech ? 'Speech: ON' : 'Speech: OFF'}</button>
          </div>
        </div>
        <div className="speechRecognition" style={{ display: this.state.speech ? 'block' : 'none' }}>
          <p>{'Transcript: ' + this.state.transcript}</p>
        </div>
      </React.Fragment>
    );
  }
}

const options = {
  autoStart: false
}

export default Room;
