import * as ex from 'excalibur';

import Settings from './settings';

export default ex.UIActor.extend({
  constructor(engine, chopper) {
    const centerModifier = engine.drawHeight / 4;
    ex.Actor.apply(this, [0, 0]);
    this.chopper = chopper;
    this.maxScore = 0;
    this.powerLabel = new ex.Label(Object.assign({}, Settings.labelBase, {
      pos: new ex.Vector(20, 20),
    }));
    this.scoreLabel = new ex.Label(Object.assign({}, Settings.labelBase, {
      pos: new ex.Vector(20, engine.drawHeight - 64),
    }));
    this.warningLabel = new ex.Label(Object.assign({}, Settings.labelBase, {
      fontSize: 78,
      textAlign: ex.TextAlign.Center,
      baseAlign: ex.BaseAlign.Top,
      pos: new ex.Vector(engine.drawWidth / 2, (engine.drawHeight / 2) - centerModifier - 75),
      color: ex.Color.Red,
    }));
    this.warningTextLabel = new ex.Label(Object.assign({}, Settings.labelBase, {
      fontSize: 60,
      textAlign: ex.TextAlign.Center,
      baseAlign: ex.BaseAlign.Top,
      pos: new ex.Vector(engine.drawWidth / 2, (engine.drawHeight / 2) - centerModifier),
    }));
    this.add(this.powerLabel);
    this.add(this.scoreLabel);
    this.add(this.warningLabel);
    this.add(this.warningTextLabel);
  },

  update(engine, delta) {
    ex.Actor.prototype.update.apply(this, [engine, delta]);
    let power = 0;
    let modifiedPower = 0;
    if (this.chopper.vel.y < 0) {
      power = Math.round((-this.chopper.vel.y / Settings.MAX_VELOCITY) * 100);
      modifiedPower = Math.round(
        (-this.chopper.unclampedVelocity / Settings.MAX_VELOCITY) * 100,
      ) - 100;
      if (modifiedPower > 0) {
        modifiedPower = `+${modifiedPower}`;
      }
    }
    this.powerLabel.text = `Velocity: ${power}% (${modifiedPower}%)`;

    const current = Math.round(-this.chopper.y);
    this.maxScore = this.maxScore < current ? current : this.maxScore;
    this.scoreLabel.text = `Height: ${current} Best: ${this.maxScore}`;

    let label = '';
    let labelText = '';
    if (this.chopper.hasBounced && Math.abs(this.chopper.y) > 200) {
      if (power < 75) {
        label = 'WARNING!!!';
        labelText = 'Low velocity';
      }
      if (power < 35) {
        label = 'CRITICAL!!!';
        labelText = 'Give it your all or crash';
      }
    }
    this.warningLabel.text = label;
    this.warningTextLabel.text = labelText;
  },
});
