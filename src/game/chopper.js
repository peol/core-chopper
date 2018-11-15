import * as ex from 'excalibur';

import Settings from './settings';
import Resources from './resources';

export default ex.Actor.extend({
  constructor(engine) {
    const centerX = engine.drawWidth / 2;
    this.kills = 0;
    // const centerY = engine.drawHeight / 2;
    ex.Actor.apply(this, [
      centerX,
      -150, // -centerY * Settings.scale.y,
      Settings.CHOPPER_WIDTH * Settings.scale.x + 200,
      Settings.CHOPPER_HEIGHT * Settings.scale.y,
      ex.Color.Red,
    ]);
    this.vel = new ex.Vector(0, 0);
    this.anchor = new ex.Vector(0.5, 0.6);
    this.scale.setTo(
      Settings.scale.x * Settings.CHOPPER_SCALE,
      Settings.scale.y * Settings.CHOPPER_SCALE,
    );
    this.collisionType = ex.CollisionType.Fixed;

    this.hasBounced = false;
    this.powerModifier = 1;
    this.locked = true;

    const spriteSheet = new ex.SpriteSheet(Resources.Chopper, 4, 1, 96, 32);
    this.upAnimation = spriteSheet.getAnimationByIndices(engine, [2, 1, 0], 120);
    this.upAnimation.scale = Settings.scale;
    this.upAnimation.freezeFrame = 2;
    this.downAnimation = spriteSheet.getAnimationByIndices(engine, [0, 3, 2], 120);
    this.downAnimation.scale = Settings.scale;
    this.downAnimation.freezeFrame = 2;
    this.addDrawing('up', this.upAnimation);
    this.addDrawing('down', this.downAnimation);

    this.on('collisionstart', (event) => {
      if (event.other) {
        this.kills += 1;
        event.other.crash();
      }
    });

    // TODO: fix glitchy collision
    this.on('precollision', () => {
      if (this.dead || this.y < -50) {
        return;
      }
      this.dead = true;
      this.rx = 10;
      engine.currentScene.camera.shake(10, 10, 500);
      this.vel.y = 0;
      this.y += 20;
      this.kill();
    });
  },

  update(engine, delta) {
    ex.Actor.prototype.update.apply(this, [engine, delta]);
    if (this.dead || !this.hasBounced || this.locked) {
      return;
    }
    if (this.y > 0) {
      // TODO: Remove this when floor collision is fixed
      this.dead = true;
      this.rx = 10;
      engine.currentScene.camera.shake(10, 10, 500);
      this.vel.y = 0;
      this.y += 20;
      this.kill();
    }
    const powerModifier = this.y / 50;
    this.powerModifier = powerModifier;
    if (!this.animatingUpwards) {
      this.unclampedVelocity = this.vel.y + (Settings.ACCELERATION / 100);
      this.vel.y = ex.Util.clamp(
        this.unclampedVelocity,
        -Settings.MAX_VELOCITY,
        Settings.MAX_DOWNWARDS_VELOCITY,
      );
      const velocityAngle = new ex.Vector(-Settings.LEVEL_SPEED, this.vel.y).normalize().toAngle();
      this.rotation = velocityAngle;
    }
    this.vel.y = ex.Util.clamp(this.vel.y, -Settings.MAX_VELOCITY, Settings.MAX_DOWNWARDS_VELOCITY);
    if (this.vel.y > 0) {
      this.setDrawing('down');
    }
    this.upAnimation.speed = 300 - Math.abs(this.vel.y);
    this.downAnimation.speed = 300 + Math.abs(this.vel.y);
  },

  bounce(power) {
    this.hasBounced = true;
    if (this.locked) {
      return;
    }
    if (!power) {
      // skip 0 speed to avoid "jumpy" acceleration:
      return;
    }
    const adjustedSpeed = -power * 2;
    this.lastPower = power;
    this.upAnimation.reset();
    this.setDrawing('up');
    this.unclampedVelocity = this.vel.y + (adjustedSpeed - this.powerModifier);
    this.vel.y = ex.Util.clamp(
      this.unclampedVelocity,
      -Settings.MAX_VELOCITY,
      Settings.MAX_DOWNWARDS_VELOCITY,
    );
    // Resource.FlapSound.play();
    const velocityAngle = new ex.Vector(-Settings.LEVEL_SPEED, this.vel.y).normalize().toAngle();
    this.animatingUpwards = true;
    this.actions.clearActions();
    // this.rotation = velocityAngle;
    this.actions.rotateBy(velocityAngle, 1500).callMethod(() => { this.animatingUpwards = false; });
  },
});
