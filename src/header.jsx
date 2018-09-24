import React from 'react';

import logo from './resources/qlik-core.svg';

import './header.css';

export default class Header extends React.Component {
  constructor(props) {
    super();
    this.onClose = props.onClose;
    this.state = { showBack: false };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ showBack: nextProps.showBack });
  }

  render() {
    const { showBack } = this.state;
    const back = showBack ? (
      <div className="right">
        <span onClick={() => this.onClose()}>Back to main screen</span>
      </div>
    ) : '';
    return (
      <section className="header">
        <div className="left">
          <img alt="Qlik Core logo" src={logo} />
          <span>/ Chopper</span>
        </div>
        {back}
      </section>
    );
  }
}
