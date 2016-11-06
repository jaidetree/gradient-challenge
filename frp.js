let _ = require('highland');
let format = require('util').format;

const COLORS = [
  { stop: 0, rgb: [245, 51, 0] }, // red
  { stop: 6, rgb: [248, 235, 73] }, // yellow
  { stop: 48, rgb: [44, 163, 178] }, // turk-like colors
];

function calcGradient (hours) {
  return _(COLORS).reduce({ done: false, colors: [] }, (loop, color) => {
    !loop.done && loop.colors.push(color);
    return { done: color.stop > hours, colors: loop.colors.slice(-2) };
  })
  .pluck('colors')
  .flatMap(([c1, c2]) => _(c1.rgb).zip(c2.rgb).map(([x1, x2]) => [
    x1, x2, Math.max((hours - c1.stop) / (c2.stop - c1.stop), 0),
  ]))
  .map(([c1, c2, factor]) => Math.floor(c1 + ((c2 - c1) * factor))).collect();
}

// Timer logic
// Pretty shitty but just playing around
function simulateTime () {
  let hours = 0;
  let endTime = 50;

  _((push, next) => {
    push(null, hours);
    if (hours <= endTime) setTimeout(next, 1000);
    hours += 2;
  })
  .flatMap(calcGradient) // pass it to calc gradient
  .map((gradient) => `${format(gradient)} – ${hours} hours after lead\n`)
  .pipe(process.stdout)
}

simulateTime();
