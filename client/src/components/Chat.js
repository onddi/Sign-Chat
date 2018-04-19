import React, { Component } from 'react';
import {joinRoom, leaveRoom} from '../api/chat'
import '../styles/Chat.css';

//import RoomsList from './RoomsList'
import Room from './Room'

class Chat extends Component {

  constructor(props){
    super(props)

    this.state = { selectedRoom: '' }

    this.changeRoom = this.changeRoom.bind(this);
  }

  componentDidMount(){
    this.changeRoom('Alexa')
  }

  changeRoom(roomId) {
    const {selectedRoom} = this.state
    console.log("Changing room form", selectedRoom, "to", roomId)
    if(selectedRoom === roomId) return
    leaveRoom(selectedRoom)
    joinRoom(roomId)
    this.setState({selectedRoom: roomId})
  }

  render() {
    const {selectedRoom} = this.state

    /*
    const {rooms} = this.props
    <RoomsList rooms={rooms} changeRoom={this.changeRoom} selectedRoom={selectedRoom}/>
    */

    return (
      <div className="Chat">
        {selectedRoom &&
          <Room selectedRoom={selectedRoom} />
        }
      </div>
    );
  }
}

export default Chat;
