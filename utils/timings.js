import { getConsoleForNamespace } from './console'

const console = getConsoleForNamespace('timings')

const timings = {};

export const getPrev = () =>
  (typeof localStorage !== "undefined" && localStorage.getItem("litTimings")) ||
  "";

export const time = (ns, marker) => {
  const now = Date.now();
  timings[ns] = (!marker || ! timings[ns])
    ? {
        start: now,
        marks: [],
        timeTo: {},
      }
    : timings[ns];

  timings[ns].marks.push({ marker, time: now });
  if (marker) {
    const id = now;
    const index = timings[ns].marks.length;
    const last = timings[ns]?.marks[index-1]?.time || timings[ns]?.start
    const took = now - last;
   
    timings[ns].timeTo[marker] = took;
    console.log(`[timings][${ns}] "start" to "${marker}" took ${took}ms`);
    const log = JSON.stringify({ ns, marker, id, took, index }) + "\n";

    if (typeof localStorage !== "undefined")
      localStorage.setItem("litTimings", getPrev() + log);
  }
};

export const getTimings = () => timings;
