import React from 'react';

import Scan from './scan';
import HighScore from './high-score';
import PowerChart from './power-chart';

import './layout.css';

export default class Dashboard extends React.Component {
  constructor(props) {
    super();
    this.state = { user: props.user };
    this.done = props.onDone;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.user });
  }

  render() {
    const { user } = this.state;
    return (
      <div className="dashboard">
        <div className="top">
          <Scan user={user} onDone={u => this.done(u)} />
          <HighScore />
        </div>
        <PowerChart />
      </div>
    );
  }
}
