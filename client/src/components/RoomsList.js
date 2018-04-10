import React, { Component } from 'react';
import { createRoom, joinRoom, joinableRooms, leaveRoom } from '../api/chat'
import { testAction, listRooms } from '../megablob/actions'

class RoomsList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      roomInput: ''
    };

    this.handleRoomInput = this.handleRoomInput.bind(this);
    this.createRoom = this.createRoom.bind(this);
  }

  handleRoomInput(event) {
    this.setState({ roomInput: event.target.value });
  }

  createRoom() {
    createRoom(this.state.roomInput)
    this.setState({ roomInput: '' });
  }

  render() {
    const { roomInput } = this.state
    const { rooms, selectedRoom, changeRoom } = this.props

    return (
      <div className="RoomsList">
        <div class="input-group mb-3">
          <input type="text" value={roomInput} onChange={this.handleRoomInput} class="form-control" placeholder="Room name" aria-label="Recipient's username" aria-describedby="basic-addon2" />
          <div class="input-group-append">
            <button onClick={this.createRoom} class="btn btn-outline-secondary" type="button">Create room</button>
          </div>
        </div>
        <h3>Rooms</h3>
        <ul className="rooms list-group">
          {rooms && rooms.map((c, i) => <li key={i}
            className={selectedRoom === c ? 'list-group-item selected-room' : 'list-group-item'}
            onClick={() => changeRoom(c)}>
            {c}
          </li>)}
        </ul>
      </div>
    )
  }
}

export default RoomsList;
