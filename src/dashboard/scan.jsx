import React from 'react';

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
    user.name = evt.target.value.trim();
    if (!user.userid) {
      user.userid = user.name;
    }
    if (user.name !== '' && evt.key === 'Enter') {
      // close view
      this.done(user);
    }
  }

  render() {
    const { user, useScanner } = this.state;
    const manual = (
      <div className="name">
        <p>
Write your name:
          {' '}
          <input autoFocus onKeyUp={evt => this.manualInput(evt)} />
        </p>
      </div>
    );
    const scanner = (
      <div className="scan">
        <div className="badge" onClick={() => this.setState({ useScanner: !useScanner })}>
          <h2>Scan ID badge to play!</h2>
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
