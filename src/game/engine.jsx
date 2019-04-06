import React, { useRef, useState, useEffect } from 'react';
import * as ex from 'excalibur';
import { useModel, useLayout } from 'hamus.js';

import Chopper from './chopper';
import Cloud from './cloud';
import FlyingObject from './flying-object';
import Floor from './floor';
import Resources from './resources';
import Settings from './settings';
import CountDown from './count-down';
import GameOver from './game-over';
import HUD from './hud';

import './engine.css';

const genericProps = {
  qInfo: {
    qType: 'highscore',
  },
  qHyperCubeDef: {
    qDimensions: [
      { qDef: { qFieldDefs: ['[userid]'] } },
      { qDef: { qFieldDefs: ['[name]'] } },
      {
        qDef: {
          qFieldDefs: ['[score]'],
          qReverseSort: true,
          qSortCriterias: [{ qSortByNumeric: true }],
        },
        qNullSuppression: true,
      }],
    qInitialDataFetch: [{
      qWidth: 3,
      qHeight: 1000,
    }],
    qSuppressMissing: true,
    qInterColumnSortOrder: [2, 0],
  },
};

export default function ({ app, player, socket }) {
  const [layout] = useLayout(useModel(app, genericProps)[0]);
  const gameid = useRef(null);
  const chopperRef = useRef(null);
  const [canvasId] = useState(`canvas${Date.now()}`);

  useEffect(() => {
    const changed = (data) => { gameid.current = data.gameid; };
    socket.on('game:created', changed);
    return () => socket.off('game:created', changed);
  }, [socket]);

  useEffect(() => {
    const ticked = ({ power }) => {
      const chopper = chopperRef.current;
      if (!chopper) return;
      chopper.bounce(power);
    };
    socket.on('game:tick', ticked);
    return () => socket.off('game:tick', ticked);
  }, [socket]);

  useEffect(() => {
    if (!layout) return;
    const loader = new ex.Loader();
    Object.keys(Resources).forEach(key => loader.addResource(Resources[key]));
    const engine = new ex.Engine({
      displayMode: ex.DisplayMode.Container,
      canvasElementId: canvasId,
      suppressConsoleBootMessage: true,
      suppressPlayButton: true,
      // isDebug: true,
      backgroundColor: ex.Color.Transparent,
    });
    engine.setAntialiasing(false);
    engine.start(loader).then(() => {
      const scale = (engine.drawHeight / 800) * 0.50 + 1;
      Object.assign(Settings.scale, { x: scale, y: scale });
      const chopper = new Chopper(engine);
      const countDown = new CountDown(engine, chopper);
      const hud = new HUD(engine, chopper, layout);
      const gameOver = new GameOver(engine, chopper);
      countDown.go = () => {
        socket.send({
          type: 'game:create',
          data: {
            userid: player.userid,
          },
        });
      };
      gameOver.go = () => {
        socket.send({
          type: 'game:end',
          data: {
            gameid: gameid.current,
            score: hud.maxScore,
            bonus: chopper.kills,
          },
        });
      };
      chopperRef.current = chopper;
      for (let i = 0; i < Settings.OBJECTS_OVER_CHOPPER; i += 1) {
        engine.add(new FlyingObject(engine, chopper));
      }
      engine.add(chopper);
      engine.add(countDown);
      engine.add(gameOver);
      engine.add(new Cloud(800, 500 * Settings.scale.y, chopper));
      engine.add(new Cloud(400, 300 * Settings.scale.y, chopper));
      engine.add(new Cloud(700, 700 * Settings.scale.y, chopper));
      for (let i = 0; i < engine.drawWidth; i += 61 * Settings.scale.y) {
        engine.add(new Floor(i, 0));
      }

      for (let i = 0; i < Settings.OBJECTS_UNDER_CHOPPER; i += 1) {
        engine.add(new FlyingObject(engine, chopper));
      }
      engine.add(hud);
      engine.input.pointers.primary.on('down', () => {
        chopper.bounce(250);
      });
      engine.currentScene.camera.strategy.lockToActor(chopper);
    });
  }, [layout, canvasId, player, socket]);

  return <div className="engine"><canvas id={canvasId} /></div>;
}
