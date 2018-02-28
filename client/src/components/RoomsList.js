import React from 'react';

const RoomsList = ({rooms, changeRoom, currentRoom}) => {

  return (
    <React.Fragment>
      <h1>Rooms</h1>
      <ul className="rooms">
        {rooms.map((c,i) => <li key={i}
                                className={currentRoom === c ? 'selected-room' : ''}
                                onClick={() => changeRoom(c)}>
                                {c}
                             </li>)}
      </ul>
    </React.Fragment>
  )
}

export default RoomsList
