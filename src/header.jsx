import React from 'react';

import logo from './resources/qlik-core.svg';

import './header.css';

export default function ({ player }) {
  const right = (
    <div className="right">
      {player.userid ? <span onClick={() => window.location.reload()}>Sign out</span> : ''}
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
