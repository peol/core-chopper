import * as ex from 'excalibur';

const DEFAULT_SCALE = new ex.Vector(1.0, 1.0);

export default {
  DEFAULT_SCALE,
  CHOPPER_WIDTH: 96,
  CHOPPER_HEIGHT: 32,
  CHOPPER_SCALE: 2,
  CHOPPER_IMPULSE: -150,
  ACCELERATION: 250,
  MAX_VELOCITY: 350,
  MAX_DOWNWARDS_VELOCITY: 2000,
  LEVEL_SPEED: -1200,
  OBJECTS_OVER_CHOPPER: 10,
  OBJECTS_UNDER_CHOPPER: 10,
  SPACE_LEVEL: -15000,
  scale: DEFAULT_SCALE,
  labelBase: {
    baseAlign: ex.BaseAlign.Top,
    fontFamily: 'VT323',
    fontSize: 48,
    color: ex.Color.White,
  },
};
