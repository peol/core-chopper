import * as ex from 'excalibur';

import chopper from '../resources/sprites/chopper.png';
import bss2 from '../resources/sprites/brickspritesheet.png';
import cloud from '../resources/sprites/cloud.png';
import qlik from '../resources/sprites/qlik.png';
import bird from '../resources/sprites/bird.png';
import bird2 from '../resources/sprites/bird3.png';
import ufo from '../resources/sprites/ufo.png';
import boom from '../resources/sprites/boom.png';

export default {
  Chopper: new ex.Texture(chopper),
  BrickSpriteSheet: new ex.Texture(bss2),
  Cloud: new ex.Texture(cloud),
  Qlik: new ex.Texture(qlik),
  Bird: new ex.Texture(bird),
  Bird2: new ex.Texture(bird2),
  Ufo: new ex.Texture(ufo),
  Boom: new ex.Texture(boom),
//  FlapSound: new ex.Sound('snd/flap2.wav'),
//  FailSound: new ex.Sound('snd/fail.wav'),
//  ScoreSound: new ex.Sound('snd/score.wav'),
};
