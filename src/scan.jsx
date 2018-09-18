import React from 'react';

import badge from './images/id-badge.svg';
import './scan.css';

export default class Scan extends React.Component {
  constructor(props) {
    super();
    this.state = { user: props.user, useScanner: true };
    this.done = props.onDone;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.user });
  }

  manualInput(evt) {
    const { user } = this.state;
    if (!user.userid) {
      user.userid = +new Date();
    }
    user.name = evt.target.value;
    if (user.name.trim() !== '' && evt.key === 'Enter') {
      // close view
      this.done(user);
    }
  }

  render() {
    const { user, useScanner } = this.state;
    const manual = (
      <p>
Write your name:
        {' '}
        <input autoFocus onKeyUp={evt => this.manualInput(evt)} />
      </p>
    );
    const scanner = (
      <div className="scan">
        <div className="badge" onClick={() => this.setState({ useScanner: !useScanner })}>
          <img alt="ID badge icon" src={badge} />
          <p>Scan your ID badge to begin</p>
        </div>
      </div>
    );
    if (!user.userid) {
      return useScanner ? scanner : manual;
    } if (!user.name) {
      return (
        <div className="name">
          <p>
Looks like this is your first time riding the chopper!
Please fill in your name:
          </p>
          <input onKeyUp={evt => this.manualInput(evt)} />
        </div>
      );
    }
    return (<p>None</p>);
  }
}
