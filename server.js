require('dotenv').config();
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var sha1 = require('js-sha1');
var dns = require('dns');

var app = express();
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  '/public',
  express.static(`${process.cwd()}/public`)
);

app.get("/", function (req, res) {
  return res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/timestamp/", function(req, res) {
  return res.json({
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
      return res.json({ "error": "Invalid Date" });
    }
  }
  return res.json({
    "unix": date.getTime(),
    "utc": date.toUTCString()
  });
});

app.get("/api/whoami", function(req, res) {
  return res.json({
    "ipaddress": req.connection.remoteAddress,
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"]
  })
});


/* URL Shortener */
const URL = require("./database.js").URLModel;
const createURL = require("./database.js").createAndSaveURL;

app.get('/api/shorturl/:route', async (req, res) => {
  const route = req.params.route;
  const instance = await URL.findOne({short_url: route});
  if (instance) {
    return res.redirect(`${instance.original_url}`);
  } else {
    return res.json({ error: 'invalid url' });
  }
})

app.post("/api/shorturl/new", function(req, res) {
  const original_url = req.body.url;
  const hostname = original_url
    .replace(/http[s]?\:\/\//, '')
    .replace(/\/(.+)?/, '');

  dns.lookup(hostname, (err, address) => {
    if (err || !address) return res.json({ error: 'invalid url' });
    url = {
      original_url: original_url,
      short_url: sha1(original_url).slice(0, 5)
    };
    createURL(url, (err, data) => {
      if (err) {
        return res.sendStatus(500);
      } else {
        return res.json(url);
      }
    });
  });
});

/* Listening to specified port */
const port = process.env.PORT || 3000;
var listener = app.listen(port, function () {
  console.log(`Your app is listening on ${port}`);
});
