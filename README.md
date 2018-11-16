# core-chopper

A Qlik Core gamification using bicycle sensors.

## Prerequisites

**This repository currently requires physical/hardware sensors to properly test it:**

* ANT+ USB stick to receive ANT+ events
* ANT+ sensors attached to e.g. a bike

### Windows

Additional components are needed on Windows:

* node-gyp build tools: `npm i -g --production windows-build-tools`
* USB driver for the ANT+ stick: http://zadig.akeo.ie/

## Get started

```bash
docker-compose up -d
npm i
node server
```

And in another terminal:

```bash
npm start
```

Open http://localhost:1234.

## TODO

### Features

* Add graphics for e.g. "velocity text" [*********--]
* Implement multiple modes
* Do not drop all the way to 0 height when dying, add warning when descending more than X, then kill at X * 1.5

### Fixes

* Refactor game implementation
  * Fix physics/animations, make them less jaggy
  * Fix sprites for floor and clouds
  * Fix floor collision
