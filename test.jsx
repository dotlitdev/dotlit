return (async args => {

const b = document.body
const ch = b.clientHeight
const sh = b.scrollHeight
const st = b.scrollTop

const c = (ch/2)+st
const cp = c / sh
  const y = cp
  const confetti = (await 
  import('https://cdn.skypack.dev/canvas-confetti')).default
  // do this for 30 seconds
var duration = 30 * 1000;
var end = Date.now() + duration;

(function frame() {
  // launch a few confetti from the left edge
  confetti({
    particleCount: 7,
    angle: 60,
    spread: 55,
    origin: { x: 0 }
  });
  // and launch a few from the right edge
  confetti({
    particleCount: 7,
    angle: 120,
    spread: 55,
    origin: { x: 1 }
  });

  // keep going until we are out of time
  if (Date.now() < end) {
    console.log("still going")
    requestAnimationFrame(frame);
  }
}());
})()