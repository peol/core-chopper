import React from 'react';

import './scan.css';

function signInAsTestUser(socket) {
  socket.send({
    type: 'player:save',
    data: {
      userid: 'test',
      name: 'Test U',
      cardid: 'test',
    },
  });
}

function playerScanned(socket, player) {
  socket.receive(JSON.stringify({
    type: 'player:scanned',
    data: player,
  }));
}


export default function ({ player, socket }) {
  const manualInput = (evt) => {
    const newPlayer = Object.assign({}, player);
    newPlayer.name = evt.target.value.trim();
    if (newPlayer.userid && newPlayer.name !== '' && evt.key === 'Enter') {
      // save it:
      socket.send({ type: 'player:save', data: newPlayer });
    }
  };

  let view;

  if (!player || !player.userid) {
    view = (
      <h2 onClick={() => signInAsTestUser(socket)}>Scan ID badge to sign in!</h2>
    );
  } else if (player.userid && !player.name) {
    view = (
      <div className="name">
        <p>
Looks like this is your first time flying the chopper!
Please fill in your name:
        </p>
        <input autoFocus onKeyUp={manualInput} />
      </div>
    );
  } else {
    view = (
      <h2 onClick={() => playerScanned(socket, player)}>
Welcome,
        {' '}
        <strong>{player.name}</strong>
! Scan your ID badge again to play!
      </h2>
    );
  }
  return (<div className="scan">{view}</div>);
}
