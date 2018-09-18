import * as ex from 'excalibur';

import Settings from './settings';

export default ex.UIActor.extend({
  constructor(engine, chopper) {
    ex.Actor.apply(this, [0, 0]);
    this.chopper = chopper;
    this.gameOverLabel = new ex.Label({
      textAlign: ex.TextAlign.Center,
      baseAlign: ex.BaseAlign.Top,
      fontFamily: 'VT323',
      fontSize: 42,
      pos: new ex.Vector(engine.drawWidth / 2, (engine.drawHeight / 2) - 100),
      color: ex.Color.White,
    });
    this.add(this.gameOverLabel);
  },

  update(engine, delta) {
    ex.Actor.prototype.update.apply(this, [engine, delta]);
    if (this.chopper.dead && !this.gameOverLabel.text) {
      this.gameOverLabel.text = 'Game over, well played!';
      this.go();
    }
  },
});
