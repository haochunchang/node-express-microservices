/** Timestamp API services */

/** Get current UNIX and UTC timestamp */
function getCurrentTimestamp(_req, res) {
  return res.json({
    "unix": new Date().valueOf(),
    "utc": new Date().toUTCString()
  });
}

/** Get UNIX and UTC timestamp */
function getTimestamp(req, res) {
  const dateString = req.params.date_string;
  let date;
  if (/\d{5,}/.test(dateString)) {
    date = new Date(parseInt(dateString));
  } else {
    date = new Date(dateString);
    if (date.toString() === "Invalid Date") {
      return res.json({ "error": "Invalid Date" });
    }
  }
  return res.json({
    "unix": date.getTime(),
    "utc": date.toUTCString()
  });
}

module.exports = {
  getCurrentTimestamp: getCurrentTimestamp,
  getTimestamp: getTimestamp
}
