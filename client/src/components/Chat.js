import React, { Component } from 'react';
import {createRoom, listenForMessages, newMessage, joinRoom, joinableRooms, leaveRoom} from '../api/chat'
import RoomsList from './RoomsList'
import '../styles/Chat.css';

class Chat extends Component {

  constructor(props){
    super(props)

    this.state = {
      messages: [],
      rooms: [],
      messageInput: '',
      roomInput: '',
      selectedRoom: '',
      show: false,
      speech: true
    };

    this.handleMessageInput = this.handleMessageInput.bind(this);
    this.handleRoomInput = this.handleRoomInput.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.changeRoom = this.changeRoom.bind(this);
    this.toggleSpeech = this.toggleSpeech.bind(this);
    this.speak = this.speak.bind(this);
  }

  componentDidMount() {

    joinableRooms(rooms => { this.setState({rooms}) })

    listenForMessages(value => {
      const {user, message, time} = value
      console.log("ROOM msg", user, message, time)
      this.setState({messages: this.state.messages.concat({user, message, time})})
      this.speak(message);
    })
  }

  speak(mumble){
    if(this.state.speech){
      const synth = window.speechSynthesis;
      const utterThis = new SpeechSynthesisUtterance(mumble)
      synth.speak(utterThis);
    }
  }

  toggleSpeech(){
    this.setState({speech: !this.state.speech});
  }

  componentDidUpdate() {
    const elem = document.getElementById('messages');
    if(elem) elem.scrollIntoView(false)
  }

  handleMessageInput(event) {
    this.setState({messageInput: event.target.value});
  }

  handleRoomInput(event) {
    this.setState({roomInput: event.target.value});
  }

  createRoom() {
    createRoom(this.state.roomInput)
    this.setState({roomInput: ''});
  }

  sendMessage(){
    newMessage({roomId: this.state.selectedRoom, message: this.state.messageInput})
    this.setState({messageInput: ''})
  }

  changeRoom(roomId) {
    const {selectedRoom} = this.state
    console.log("Changing room form", selectedRoom, "to", roomId)
    if(selectedRoom === roomId) return

    leaveRoom(selectedRoom)
    joinRoom(roomId)
    this.setState({selectedRoom: roomId, messages: []})
  }

  render() {
    const {messages, messageInput, roomInput, rooms, selectedRoom} = this.state
    const messageList = messages.map((d, i) => <li key={i}>[{d.time}] {d.user.substring(0,5)}: {d.message}</li>);

    return (
      <div className="Chat">
        <div className="RoomsList">
          <input type="text" value={roomInput} onChange={this.handleRoomInput}/>
          <button onClick={this.createRoom} >Create room</button>
          <RoomsList rooms={rooms} changeRoom={this.changeRoom} currentRoom={selectedRoom}/>
        </div>
        {selectedRoom &&
          <React.Fragment>
            <div className="RoomHeader">
              <h1>Current room: {selectedRoom}</h1>
            </div>
            <div className="RoomMessages">
              <ul id="messages">{messageList}</ul>
            </div>
            <div className="MessageInputArea">
              <input type="text" value={messageInput} onChange={this.handleMessageInput}/>
              <button onClick={this.sendMessage} >Send</button>
              <button onClick={this.toggleSpeech} >
                { this.state.speech ? 'Speech off': 'Speech on'}
              </button>
            </div>
          </React.Fragment>
        }
      </div>
    );
  }
}

export default Chat;
