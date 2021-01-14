require('dotenv').config();
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
const dns = require('dns');

var app = express();
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(
  '/public',
  express.static(`${process.cwd()}/public`)
);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
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

app.get("/api/whoami", function(req, res) {
  res.json({
    "ipaddress": req.connection.remoteAddress,
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"]
  })
});

var urlParser = bodyParser.urlencoded({ extended: false });
const createURL = require("./database.js").createAndSaveURL;
const findURL = require("./database.js").findURLByShort;
const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};
app.post("/api/shorturl/new", urlParser, function(req, res) {
  const original_url = req.body.url.replace(/^https?:\/\//, '');
  dns.lookup(original_url, (err, address, family) => {
    if (err) res.json({ error: 'invalid url' })
    else console.log(`Address: ${address}, IPv${family}`);
  });
  url_mapping = {
    original_url: original_url,
    short_url: getRandomInt(1000)
  };
  createURL(url_mapping, (status, data) => {});
  res.json(url_mapping);
});

app.get("/api/shorturl/\\d+$", function(req, res) {
  const parsedUrl = req.originalUrl.split("/");
  const id = parsedUrl[parsedUrl.length - 1];
  // var result = findURL(req, () => {});
  // console.log(result);
});

/* Listening to specified port */
const port = process.env.PORT || 3000;
var listener = app.listen(port, function () {
  console.log(`Your app is listening on ${port}`);
});
