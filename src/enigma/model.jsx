import React from 'react';
import getDoc from './session';

export default class Model extends React.Component {
  constructor(props) {
    super();
    this.state = {};
    this.init(props.genericProps);
  }

  componentWillUnmount() {
    const { model } = this.state;
    if (model) {
      model.removeListener('changed', this.onChanged);
    }
  }

  async init(genericProps) {
    const doc = await getDoc();
    const model = await doc.getOrCreateObject(genericProps.qInfo.qType, genericProps);
    this.onChanged = async () => {
      const layout = await model.getLayout();
      this.setState({ model, layout });
    };
    model.on('changed', this.onChanged);
    model.emit('changed');
  }

  render() {
    const { layout } = this.state;
    return (
      <p>
No render fn for
        {' '}
        {(layout && layout.qInfo.qId) || 'unknown object'}
      </p>
    );
  }
}
