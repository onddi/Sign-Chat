import React, { Component } from 'react';
import {createRoom, listenForMessages, newMessage, joinRoom, joinableRooms, leaveRoom, getJoinableRooms} from '../api/chat'
import '../styles/Chat.css';
import {testAction, listRooms} from '../megablob/actions'

import RoomsList from './RoomsList'
import Room from './Room'

class Chat extends Component {

  constructor(props){
    super(props)

    this.state = { selectedRoom: '' }

    this.changeRoom = this.changeRoom.bind(this);
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
    const {rooms} = this.props

    return (
      <div className="Chat">
        <RoomsList rooms={rooms} changeRoom={this.changeRoom} selectedRoom={selectedRoom}/>
        {selectedRoom &&
          <Room selectedRoom={selectedRoom} />
        }
      </div>
    );
  }
}

export default Chat;
