// Vanilla solution
let format = require('util').format;

const COLORS = [
  { stop: 0, rgb: [44, 163, 178] }, // turk-like colors
  { stop: 6, rgb: [248, 235, 73] }, // yellow
  { stop: 48, rgb: [245, 51, 0] }, // red
];

function getRGBColor (hours) {
  // ordering of max and min IS IMPORTANT as we're mutating the colors array with reverse
  let colors = COLORS.slice(0),
      min = colors.reduce((min, color) => color.stop <= hours ? color : min),
      max = colors.reverse().reduce((max, color) => color.stop >= hours ? color : max),
      normalizationFactor;

  max = max || min;
  min = min || max;

  // calculate the normalization factor, should always be between 0 - 1
  normalizationFactor = (hours - min.stop) / (max.stop - min.stop);

  // at this point we don't care about the stops anymore, just the rgb and factor
  // calculate and return one RGB array
  return min.rgb.map((c, i) => {
    let rgb1 = min.rgb[i],
        rgb2 = max.rgb[i],
        normalizedDiff = (rgb2 - rgb1) * normalizationFactor;

    return Math.round(rgb1 + normalizedDiff);
  });
}

// Timer logic
// Pretty shitty but just playing around
function simulateTime (hours=0) {
  let interval = setInterval(() => {
    if (hours > 50) return clearInterval(interval);
    console.log(`${format(getRGBColor(hours))} ${hours} hours after lead`);
    hours += 2; // increment by 2 hours
  }, 1000);
}

simulateTime();
