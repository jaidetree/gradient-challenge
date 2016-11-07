// Functional Reactive Programming with Highland
let _ = require('highland');
let format = require('util').format;

const COLORS = [
  { stop: 0, rgb: [44, 163, 178] }, // turk-like colors
  { stop: 6, rgb: [248, 235, 73] }, // yellow
  { stop: 48, rgb: [245, 51, 0] }, // red
];

function calcGradient (hours) {
  let done = false;

  return _(COLORS)
    .reduce([], (colors, color) => {
      !done && colors.push(color);
      done = color.stop > hours;
      return colors.slice(-2);
    })
    .map(([end, start]) => ({
      rgb: [start.rgb, end.rgb],
      factor: Math.max((hours - start.stop) / (end.stop - start.stop), 0),
    }))
    .flatMap(({ rgb, factor }) => {
      return _(rgb[0]).zip(rgb[1]).map((values) => ({ values, factor }));
    })
    .map(({ values, factor }) => {
      return Math.floor(values[0] + (values[1] - values[0]) * factor);
    })
    .collect();
}

// Timer logic
// Pretty shitty but just playing around
function simulateTime (hours=0) {
  _((push, next) => {
    push(null, hours);
    setTimeout(next, 1000);
  })
  .take(26)
  .flatMap(calcGradient) // pass it to calc gradient
  .map((gradient) => `${format(gradient)} – ${hours} hours after lead\n`)
  .tap(() => hours += 2)
  .pipe(process.stdout)
}

simulateTime();
