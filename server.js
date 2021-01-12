// server.js
// where your node app starts

var express = require('express');
var app = express();

var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


app.get("/api/timestamp/", function(req, res) {
  res.json({
    "unix": new Date().valueOf(),
    "utc": new Date().toUTCString()
  });
});

app.get("/api/timestamp/:date_string?", function(req, res) {
  const dateString = req.params.date_string;
  let date;
  if (/\d{5,}/.test(dateString)) {
    date = new Date(parseInt(dateString));
  } else {
    date = new Date(dateString);
    if (date.toString() === "Invalid Date") {
      res.json({ "error": "Invalid Date" });
    }
  }
  res.json({
    "unix": date.getTime(),
    "utc": date.toUTCString()
  });
});


var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

