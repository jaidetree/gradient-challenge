// Functional Reactive Programming
let _ = require('highland');
let format = require('util').format;

const COLOR_TABLE = [
  {
    rgb: [245, 51, 0], // red
    stop: 0,
  },
  {
    rgb: [248, 235, 73], // yellow
    stop: 6,
  },
  {
    rgb: [44, 163, 178], // turk-like colors
    stop: 48,
  },
];

function calcGradient (input) {
  return _([ input ])
    // Calculate the duration & hours of the time between now & the event
    .map((data) => {
      data.duration = data.eventDate - data.now;
      data.hours = Math.ceil(data.duration / 1000 / 60 / 60);
      return data;
    })
    // Get the two colors we need to switch to
    .flatMap((data) => {
      return _(COLOR_TABLE)
        // Takes colors until we no longer match their stop
        .reduce({ done: false, colors: [] }, (reduction, color) => {
          // A very cheap way to not use an if statement :D
          !reduction.done && reduction.colors.push(color);

          reduction.done = data.hours < color.stop;

          return reduction;
        })
        // grab the colors property from the data object
        .pluck('colors')
        // Ensures there are always at least 2 colors in the event we're still
        // before 48 hours or after the event has occurred
        .map((colors) => [colors[0]].concat(colors))
        // Only use the last two items.
        .map((colors) => colors.slice(-2))
        // Merge in our colors back into mainstream's our data
        .map(([colorA, colorB]) => Object.assign(data, {
          colors: {
            prev: colorB,
            next: colorA,
          },
        }));
    })
    // Get our progress factor to so we know where to transition between the
    // two colors
    .map((data) => {
      let { hours, colors: { prev, next } } = data;
      let normalProgress = (hours - prev.stop) / (next.stop - prev.stop);

      return Object.assign(data, {
        progress: Math.min(Math.max(normalProgress, 0), 1),
      });
    })
    // Find a color that is transitional between the two colors
    .flatMap((data) => {
      let { colors: { prev, next }, progress } = data;

      return _(( prev.rgb ))
        .zip(next.rgb)
        .map(([ start, end ]) => start + ((end - start) * progress))
        .map(Math.floor)
        .collect()
        .map((gradient) => ({
          gradient,
          hours: data.hours,
          time: data.now,
        }));
    })
}

// Timer logic
// Pretty shitty but just playing around
function simulateTime () {
  const NOW = Date.now();
  const eventDate = NOW + (1000 * 60 * 60 * 24 * 4); // 4 days from now

  let currentTime = NOW;

  _((push) => {
    interval = setInterval(() => {
      currentTime += 1000 * 60 * 60 * 2; // increment by 2 hours
      push(null, currentTime);
      if (currentTime >= eventDate + 3000) {
        clearInterval(interval);
        push(null, _.nil);
      }
    }, 1000);
  })
  .map(() => ({ // map it to an input object
    eventDate,
    now: currentTime,
  }))
  .flatMap(calcGradient) // pass it to calc gradient
  .map(data => { // format the output
    return `${format(data.gradient)} ${new Date(data.time).toString()} – ${data.hours} hours before event\n`;
  })
  .pipe(process.stdout)
}

simulateTime();
