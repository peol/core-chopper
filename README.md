# core-chopper

A Qlik Core gamification using bicycle sensors.

## Prerequisites

**This repository currently requires physical/hardware sensors:**

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

* Add interactions to high score/power chart
* Add "Next position: 1230 (9th place, user)" in UI
* Add graphics for e.g. "velocity text" [*********--]
* Implement multiple modes
* Add things during ascent to provide surprise moments (like the monster in Ski Free from Win 3.11)
* Do not drop all the way to 0 height when dying, add warning when descending more than X, then kill at X * 1.5

### Fixes

* Fix backend sync when using manual sign in (currently no events are saved I think)
* Make server stateless (currently uses global variables to keep track of users)
* Refactor game implementation
  * Fix physics/animations, make them less jaggy
  * Fix sprites for floor and clouds
  * Fix floor collision
