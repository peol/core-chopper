import React from 'react';

import logo from './resources/qlik-core.svg';

import './header.css';

export default class Header extends React.Component {
  constructor({ player }) {
    super();
    this.state = { player };
  }

  componentWillReceiveProps({ player }) {
    this.setState({ player });
  }

  // todo: fix this.setState({ player: { userid: null, name: null } })
  // need to tear down the game engine instance somehow
  /* eslint no-restricted-globals:0 */
  render() {
    const { player } = this.state;
    const right = (
      <div className="right">
        {player.userid ? <span onClick={() => location.reload()}>Sign out</span> : ''}
      </div>
    );
    return (
      <section className="header">
        <div className="left">
          <img alt="Qlik Core logo" src={logo} />
          <span>/ Chopper</span>
        </div>
        {right}
      </section>
    );
  }
}
