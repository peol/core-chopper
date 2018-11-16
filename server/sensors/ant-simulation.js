const { tween } = require('shifty');

module.exports = ({
  power = 0, maxPower = 400, duration = 120000, easing = 'easeInOutQuint', onTick,
}) => {
  let i = 0;
  let mod = 1;
  const updateMod = () => {
    let r = 0;
    while (r < 0.95) r = Math.random() * 1.05;
    mod = r;
  };
  tween({
    from: { x: power, y: 0 },
    to: { x: maxPower, y: 0 },
    duration,
    // https://easings.net/
    easing,
    step: (v) => {
      i += 1;
      if (i % 180 === 0) updateMod();
      if (i % 15 === 0) onTick(v.x * mod);
    },
  });
};
