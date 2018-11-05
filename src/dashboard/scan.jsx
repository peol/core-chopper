import React from 'react';

import './scan.css';

export default class Scan extends React.Component {
  constructor({ player, socket }) {
    super();
    this.state = { player, socket };
  }

  componentWillReceiveProps({ player }) {
    this.setState({ player });
  }

  manualInput(evt) {
    const { player, socket } = this.state;
    player.name = evt.target.value.trim();
    if (player.userid && player.name !== '' && evt.key === 'Enter') {
      // save it:
      socket.send({ type: 'player:save', data: player });
    }
  }

  testUser() {
    const { socket } = this.state;
    socket.send({
      type: 'player:save',
      data: {
        userid: 'test',
        name: 'Test U',
        cardid: 'test',
      },
    });
  }

  testUserScanned() {
    const { socket, player } = this.state;
    socket.receive(JSON.stringify({
      type: 'player:scanned',
      data: player,
    }));
  }

  render() {
    const { player } = this.state;

    let view;

    if (!player || !player.userid) {
      view = (
        <h2 onClick={() => this.testUser()}>Scan ID badge to sign in!</h2>
      );
    } else if (player.userid && !player.name) {
      view = (
        <div className="name">
          <p>
Looks like this is your first time flying the chopper!
Please fill in your name:
          </p>
          <input autoFocus onKeyUp={evt => this.manualInput(evt)} />
        </div>
      );
    } else {
      view = (
        <h2 onClick={() => this.testUserScanned()}>
Welcome,
          {' '}
          <strong>{player.name}</strong>
! Scan your ID badge again to play!
        </h2>
      );
    }
    return (<div className="scan">{view}</div>);
  }
}
