const date = new Date();
const isoDate = date.toISOString().split("T")[0];
const today = isoDate;
const year = date.getFullYear();
const month = isoDate.split("-").slice(0, -1).join("-");

const firstDayOfYear = new Date(year, 0, 1);
const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
const week = [
  year,
  "w" + Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7),
].join("-");

const prefix = `/testing/log/`;
const pathFor = (log) => `${prefix}${log}.lit`;

const checkForTodayFile = async () => {
  let stat;
  try {
    stat = await lit.fs.readStat(pathFor(today));
  } catch (err) {}
  return `*Today* is [**${today}**](${pathFor(today)}), a log exists: *${
    !!stat && !!(stat.local.stat || stat.remote.stat)
  }*; See [week](${pathFor(week)}), [month](${pathFor(
    month
  )}) or [year](${pathFor(year)}).`;
};

return checkForTodayFile();
