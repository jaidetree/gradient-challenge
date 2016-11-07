// Functional Reactive Programming with RxJS
let Rx = require('rxjs');
let format = require('util').format;

//////////////////////////////////////////////////////////////////////////////
// Solution using slightly different data structure

const TURK = [44, 163, 178];
const ORANGE = [248, 235, 73];
const RED = [245, 51, 0];

const RANGES = [
  { start: 0, end: 6, colors: [TURK, ORANGE] },
  { start: 6, end: 48, colors: [ORANGE, RED] },
];

function calcGradient (hours) {
  return Rx.Observable.from(RANGES)
    .first((range) => range.end >= Math.min(hours, 48))
    .map(({ start, end, colors }) => ({
      rgb1: colors[0],
      rgb2: colors[1],
      factor: Math.min((hours - start) / (end - start), 1),
    }))
    .concatMap(
      ({ rgb1, rgb2 }) => Rx.Observable.from(rgb1).zip(rgb2),
      ({ factor }, [ c1, c2 ]) => Math.floor(c1 + (c2 - c1) * factor)
    )
    .toArray();
}

//////////////////////////////////////////////////////////////////////////////
// Solution using the original data structure:

const COLORS = [
  { stop: 0, rgb: [44, 163, 178] }, // turk-like colors
  { stop: 6, rgb: [248, 235, 73] }, // yellow
  { stop: 48, rgb: [245, 51, 0] }, // red
];

function calcGradient2 (hours) {
  let colorStream = Rx.Observable.from(COLORS),
      maxHours = Math.min(hours, 48),
      start = colorStream.last((color) => maxHours >= color.stop),
      end = colorStream.skip(1).first((color) => maxHours <= color.stop);

  return Rx.Observable.merge(start, end)
    .toArray()
    .map(([ start, end ]) => ({
      rgb: [start.rgb, end.rgb],
      factor: Math.max((maxHours - start.stop) / (end.stop - start.stop), 0),
    }))
    .flatMap(({ rgb, factor }) => {
      return Rx.Observable.range(0, 3).map((i) => {
        let c1 = rgb[0][i], c2 = rgb[1][i];

        return Math.floor(c1 + (c2 - c1) * (factor || 0));
      });
    })
    .toArray();
}

function simulateTime () {
  return Rx.Observable.interval(1000)
    .take(26)
    .map((i) => i * 2)
    .flatMap(calcGradient)
    .map((color, i) => `${format(color)} - ${i * 2} hours after lead`)
    .subscribe(console.log.bind(console));
}

simulateTime();
