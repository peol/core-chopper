import * as ex from 'excalibur';

import Settings from './settings';

export default ex.UIActor.extend({
  constructor(engine, chopper) {
    ex.Actor.apply(this, [0, 0]);
    this.chopper = chopper;
    this.countDownLabel = new ex.Label({
      textAlign: ex.TextAlign.Center,
      baseAlign: ex.BaseAlign.Top,
      fontFamily: 'VT323',
      fontSize: 42,
      pos: new ex.Vector(engine.drawWidth / 2, (engine.drawHeight / 2) - 100),
      color: ex.Color.White,
    });
    this.add(this.countDownLabel);
  },

  countDown(n) {
    let i = n;
    if (i === 0) {
      this.chopper.locked = false;
      this.chopper.hasBounced = false;
      this.countDownLabel.text = 'GO!!!';
      this.go();
      setTimeout(() => this.kill(), 2000);
      return;
    }
    this.countDownLabel.text = `Game begins in ${i} seconds...`;
    i -= 1;
    setTimeout(() => this.countDown(i), 1000);
  },

  update(engine, delta) {
    ex.Actor.prototype.update.apply(this, [engine, delta]);
    if (this.chopper.hasBounced && !this.countDownLabel.text) {
      this.countDown(5);
    }
  },
});
