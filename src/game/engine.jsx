import React from 'react';
import * as ex from 'excalibur';

import Chopper from './chopper';
import Cloud from './cloud';
import Floor from './floor';
import Resources from './resources';
import Settings from './settings';
import CountDown from './count-down';
import GameOver from './game-over';
import HUD from './hud';

import './engine.css';

let id = 0;

class Engine extends React.Component {
  constructor(props) {
    super(props);
    this.state = { canvasId: `game${id += 1}` };
    props.registerListener(result => this.socketData(result));
    this.onStarted = props.onStarted;
    this.onEnded = props.onEnded;
    this.lastRevCount = 0;
  }

  socketData(result) {
    if (result.type === 'ant-power' && this.chopper) {
      if (!result.data.Power) {
        return;
      }
      this.chopper.bounce(result.data.Power);
    }
  }

  socketSend(data) {
    return this.socket.send(JSON.stringify(data));
  }

  init() {
    const { canvasId } = this.state;
    this.isInitialized = true;

    const loader = new ex.Loader();
    Object.keys(Resources).forEach(key => loader.addResource(Resources[key]));

    const engine = new ex.Engine({
      displayMode: ex.DisplayMode.Container,
      canvasElementId: canvasId,
      suppressConsoleBootMessage: true,
      // isDebug: true,
      backgroundColor: ex.Color.Transparent,
    });
    engine.setAntialiasing(false);
    engine.start(loader).then(() => {
      const scale = (engine.drawHeight / 800) * 0.50 + 1;
      Object.assign(Settings.scale, { x: scale, y: scale });
      const chopper = new Chopper(engine);
      const countDown = new CountDown(engine, chopper);
      const hud = new HUD(engine, chopper);
      countDown.go = () => {
        this.onStarted();
      };
      const gameOver = new GameOver(engine, chopper);
      gameOver.go = () => {
        this.onEnded(hud.maxScore);
      };
      this.chopper = chopper;
      engine.add(chopper);
      engine.add(countDown);
      engine.add(gameOver);
      engine.add(new Cloud(800, 0));
      engine.add(new Cloud(400, 300 * Settings.scale.y));
      engine.add(new Cloud(700, 700 * Settings.scale.y));
      for (let i = 0; i < engine.drawWidth; i += 61 * Settings.scale.y) {
        engine.add(new Floor(i, 0));
      }
      engine.add(hud);
      engine.input.pointers.primary.on('down', () => {
        chopper.bounce(250);
      });
      engine.currentScene.camera.strategy.lockToActor(chopper);
    });
  }

  render() {
    const { canvasId } = this.state;
    if (!this.isInitialized) {
      setTimeout(() => this.init());
    }
    return <div className="engine"><canvas id={canvasId} /></div>;
  }
}

export default Engine;
