import * as ex from 'excalibur';

import Settings from './settings';
import Resources from './resources';

// create sprite sheet, res: Resource, c: Columns, r: Rows, w: width
// h: height, s: startFrame, e: endFrame
const qlikLogo = {
  res: Resources.Qlik, c: 4, r: 1, w: 10, h: 10, s: 0, e: 4, ms: 5,
};
const bird = {
  res: Resources.Bird, c: 3, r: 1, w: 12, h: 10, s: 0, e: 3, ms: 5,
};
const bird2 = {
  res: Resources.Bird2, c: 3, r: 1, w: 12, h: 10, s: 0, e: 3, ms: 5,
};
const bird3 = {
  res: Resources.Bird3, c: 3, r: 1, w: 12, h: 10, s: 0, e: 3, ms: 5,
};
const bird4 = {
  res: Resources.Bird4, c: 3, r: 1, w: 12, h: 10, s: 0, e: 3, ms: 5,
};

const sprites = [qlikLogo, bird, bird2, bird3, bird4];
let maxScale = 1;
let spst;

function randomPositionAndDirection(engine) {
  const fromY = engine.currentScene.camera.y - engine.drawHeight;
  const toY = engine.currentScene.camera.y - engine.drawHeight * 2;

  const y = ex.Util.randomInRange(fromY, toY);
  let x = 1;
  let dir = 1;
  let dDir = 'right';

  const rand = Boolean(Math.round(Math.random()));
  if (rand) {
    x = engine.drawWidth - 1;
    dir = -1;
    dDir = 'left';
  }
  return {
    x, y, dir, dDir,
  };
}

export default ex.Actor.extend({
  constructor(engine) {
    const fly = randomPositionAndDirection(engine);
    const object = Math.round(ex.Util.randomInRange(0, sprites.length - 1));
    spst = sprites[object];
    maxScale = spst.ms;
    ex.Actor.apply(this, [fly.x, fly.y, spst.w * Settings.scale.x, spst.h * Settings.scale.y]);

    this.scale = new ex.Vector(Settings.scale.x, Settings.scale.y);
    this.collisionType = ex.CollisionType.Passive;
    this.addCollisionGroup('game');

    this.vel.x = ex.Util.randomInRange(100, 400) * fly.dir;

    const spriteSheet = new ex.SpriteSheet(spst.res, spst.c, spst.r, spst.w, spst.h);
    const boomSheet = new ex.SpriteSheet(Resources.Boom, 4, 1, 115, 96);
    this.flyRight = spriteSheet.getAnimationBetween(engine, spst.s, spst.e, 100);
    this.flyRight.scale = Settings.scale;
    this.flyRight.flipHorizontal = false;
    this.flyLeft = spriteSheet.getAnimationBetween(engine, spst.s, spst.e, 100);
    this.flyLeft.scale = Settings.scale;
    this.flyLeft.flipHorizontal = true;
    this.boom = boomSheet.getAnimationBetween(engine, 0, 4, 100);
    this.boom.flipHorizontal = false;

    this.addDrawing('right', this.flyRight);
    this.addDrawing('left', this.flyLeft);
    this.addDrawing('boom', this.boom);
    this.setDrawing(fly.dDir);
    this.randomizeScale();
  },

  crash() {
    this.scale.setTo(Settings.scale.x, Settings.scale.y);
    this.setDrawing('boom');
    setTimeout(() => {
      this.x = -200;
      this.setDrawing('left');
    }, 300);
  },

  randomizeScale() {
    const rand = Math.random() * (maxScale + 1);
    this.drawWidth = spst.w * rand;
    this.drawHeight = spst.h * rand;

    this.scale.setTo(Settings.scale.x * rand, Settings.scale.y * rand);
  },

  update(engine, delta) {
    ex.Actor.prototype.update.apply(this, [engine, delta]);
    if (this.x < 0 || this.x > engine.drawWidth) {
      const fly = randomPositionAndDirection(engine);
      this.vel.x = ex.Util.randomInRange(100, 400) * fly.dir;
      this.randomizeScale(this.width, this.height);
      this.setDrawing(fly.dDir);
      this.y = fly.y;
    }
  },
});
