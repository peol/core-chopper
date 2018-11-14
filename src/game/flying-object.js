import * as ex from 'excalibur';

import Settings from './settings';
import Resources from './resources';

// create sprite sheet, res: Resource, c: Columns, r: Rows, w: width
// h: height, s: startFrame, e: endFrame
const qlikLogo = {
  res: Resources.Qlik, c: 12, r: 1, w: 83, h: 88, s: 0, e: 11,
};
const birdLogo = {
  res: Resources.Bird, c: 5, r: 3, w: 94, h: 89, s: 0, e: 14,
};
const bird2Logo = {
  res: Resources.Bird2, c: 4, r: 2, w: 96, h: 65, s: 0, e: 8,
};
const ufo = {
  res: Resources.Ufo, c: 1, r: 1, w: 96, h: 68, s: 0, e: 1,
};

const sprites = [qlikLogo, birdLogo, bird2Logo, ufo];

export default ex.Actor.extend({
  constructor(engine) {
    const fly = this.randomPositionAndDirection(engine);
    const object = this.randomIntFromInterval(0, sprites.length - 1);
    const spst = sprites[object];
    ex.Actor.apply(this, [fly.x, fly.y, spst.w * Settings.scale.x, spst.h * Settings.scale.y]);

    this.scale = new ex.Vector(Settings.scale.x, Settings.scale.y);
    this.collisionType = ex.CollisionType.Passive;
    this.addCollisionGroup('game');

    this.vel.x = ex.Util.randomInRange(100, 400) * fly.dir;

    const spriteSheet = new ex.SpriteSheet(spst.res, spst.c, spst.r, spst.w, spst.h);
    const boomSheet = new ex.SpriteSheet(Resources.Boom, 5, 4, 96, 96);
    this.flyRight = spriteSheet.getAnimationBetween(engine, spst.s, spst.e, 100);
    this.flyRight.scale = Settings.scale;
    this.flyRight.flipHorizontal = false;
    this.flyLeft = spriteSheet.getAnimationBetween(engine, spst.s, spst.e, 100);
    this.flyLeft.scale = Settings.scale;
    this.flyLeft.flipHorizontal = true;
    this.boom = boomSheet.getAnimationBetween(engine, 0, 16, 100);
    this.boom.flipHorizontal = true;

    this.addDrawing('right', this.flyRight);
    this.addDrawing('left', this.flyLeft);
    this.addDrawing('boom', this.boom);
    this.setDrawing(fly.dDir);
    this.randomizeScale();
  },

  randomPositionAndDirection(engine) {
    const fromY = engine.currentScene.camera.y - engine.drawHeight;
    const toY = engine.currentScene.camera.y - engine.drawHeight * 2;

    const yPos = ex.Util.randomInRange(fromY, toY);
    let xPos = 1;
    let direction = 1;
    let drawDirection = 'right';

    const rand = this.randomIntFromInterval(0, 1);
    if (rand) {
      xPos = engine.drawWidth - 1;
      direction = -1;
      drawDirection = 'left';
    }
    return {
      x: xPos, y: yPos, dir: direction, dDir: drawDirection,
    };
  },

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  randomizeScale() {
    const rand = Math.random();
    this.scale.setTo(Settings.scale.x * rand, Settings.scale.y * rand);
  },

  update(engine, delta) {
    ex.Actor.prototype.update.apply(this, [engine, delta]);
    if (this.x < 0 || this.x > engine.drawWidth) {
      const fly = this.randomPositionAndDirection(engine);
      this.vel.x = ex.Util.randomInRange(100, 400) * fly.dir;
      this.randomizeScale(this.width, this.height);
      this.setDrawing(fly.dDir);
      this.y = fly.y;
    }
  },

});
