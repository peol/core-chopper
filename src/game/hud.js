import * as ex from 'excalibur';

import Settings from './settings';

const createLabel = cfg => new ex.Label(Object.assign({}, Settings.labelBase, cfg));

export default ex.UIActor.extend({
  constructor(engine, chopper, layout) {
    const centerModifier = engine.drawHeight / 4;
    ex.Actor.apply(this, [0, 0]);
    this.highscores = layout.qHyperCube.qDataPages[0].qMatrix.reverse();
    this.chopper = chopper;
    this.maxScore = 0;
    this.powerLabel = createLabel({ pos: new ex.Vector(20, 20) });
    this.warningLabel = createLabel({
      fontSize: 78,
      textAlign: ex.TextAlign.Center,
      baseAlign: ex.BaseAlign.Top,
      pos: new ex.Vector(engine.drawWidth / 2, (engine.drawHeight / 2) - centerModifier - 75),
      color: ex.Color.Red,
    });
    this.warningTextLabel = createLabel({
      fontSize: 60,
      textAlign: ex.TextAlign.Center,
      baseAlign: ex.BaseAlign.Top,
      pos: new ex.Vector(engine.drawWidth / 2, (engine.drawHeight / 2) - centerModifier),
    });
    this.progressLabel = createLabel({
      pos: new ex.Vector(20, engine.drawHeight - 64),
    });
    this.add(this.powerLabel);
    this.add(this.warningLabel);
    this.add(this.warningTextLabel);
    this.add(this.progressLabel);
  },

  updatePower(power) {
    let modifiedPower = 0;
    if (this.chopper.vel.y < 0) {
      modifiedPower = Math.round(
        (-this.chopper.unclampedVelocity / Settings.MAX_VELOCITY) * 100,
      ) - 100;
      if (modifiedPower > 0) {
        modifiedPower = `+${modifiedPower}`;
      }
    }
    this.powerLabel.text = `Velocity: ${power}% (${modifiedPower}%)`;
  },

  updateProgress() {
    const hs = this.highscores;
    const current = Math.round(-this.chopper.y);
    this.maxScore = this.maxScore < current ? current : this.maxScore;
    const nextPos = hs.find(s => s[2].qNum > this.maxScore);
    const position = nextPos ? hs.length - hs.indexOf(nextPos) : 1;
    const next = nextPos
      ? `${nextPos[2].qNum - this.maxScore} (${nextPos[1].qText})`
      : "You're in the lead!";
    this.progressLabel.text = `You: ${this.maxScore} (#${position}) Next: ${next}`;
  },

  updateWarning(power) {
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

  update(engine, delta) {
    ex.Actor.prototype.update.apply(this, [engine, delta]);
    const power = Math.round((-this.chopper.vel.y / Settings.MAX_VELOCITY) * 100);
    this.updatePower(power);
    this.updateWarning(power);
    this.updateProgress();
  },
});
