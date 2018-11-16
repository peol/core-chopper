const Ant = require('aai-ant-plus');

const simulate = require('./ant-simulation');

const stick = new Ant.GarminStick3();
const speedSensor = new Ant.SpeedSensor(stick);
const cadenceSensor = new Ant.CadenceSensor(stick);
const powerSensor = new Ant.BicyclePowerSensor(stick);
const listeners = [];
let speed = 0;
let cadence = 0;
let power = 0;

// in meters, circumference (e.g. 28"*3,14*0.39=circumference in cm):
speedSensor.setWheelCircumference(2.23);

stick.on('startup', () => {
  speedSensor.attach(3, 0);
  cadenceSensor.attach(2, 0);
  powerSensor.attach(1, 0);
  console.log('ant:attached');
});

speedSensor.on('speedData', (data) => { speed = data.CalculatedSpeed; });
cadenceSensor.on('cadenceData', (data) => { cadence = data.CalculatedCadence; });
powerSensor.on('powerData', (data) => {
  if (!power && !data.Power) {
    // two consecutive non-power data points:
    return;
  }
  power = data.Power;
  listeners.forEach(l => l({ speed, cadence, power }));
});

if (!stick.open()) {
  console.log('ant:no stick');
}

module.exports = {
  simulate,
  on: (evt, fn) => { listeners.push(fn); },
  emit: (evt, data) => { listeners.forEach(l => l(data)); },
};
