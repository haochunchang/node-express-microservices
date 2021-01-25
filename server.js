require('dotenv').config();
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var sha1 = require('js-sha1');
var dns = require('dns');

var app = express();
app.use(cors({optionsSuccessStatus: 200}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  '/public',
  express.static(`${process.cwd()}/public`)
);

/* API endpoints */
app.get("/", function (req, res) {
  return res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/timestamp/", function(req, res) {
  return res.json({
    "unix": new Date().valueOf(),
    "utc": new Date().toUTCString()
  });
});

/** Get UNIX and UTC timestamp */
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

/** Get browser header information */
app.get("/api/whoami", function(req, res) {
  return res.json({
    "ipaddress": req.connection.remoteAddress,
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"]
  })
});

/** For URL shortener */
const URL = require("./url_db.js").URLModel;
const createURL = require("./url_db.js").createAndSaveURL;

/** Redirect to original URL given short URL */
app.get('/api/shorturl/:route', async (req, res) => {
  const route = req.params.route;
  const instance = await URL.findOne({short_url: route});
  if (instance) {
    return res.redirect(`${instance.original_url}`);
  } else {
    return res.json({ error: 'invalid url' });
  }
})

/** Create a new short URL for given URL */
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

/* For Exercise tracker */
const User = require("./exercise_db.js").User;

/** Create a new user with unique username */
app.post("/api/exercise/new-user", async (req, res) => {
  const name = req.body.username;
  const instance = await User.findOne({ username: name });
  if (!instance) {
    // Create new user in database
    const new_user = new User({ username: name });
    await new_user.save();
    return res.json({
      username: name,
      _id: new_user._id
    });
  }
  return res.send("Username already taken");
});

/** Get all user data in an arry */
app.get("/api/exercise/users", async (req, res) => {
  const users = await User.find();
  if (users) {
    return res.json(users);
  }
  return res.send("There is no user.");
});

/** Get user data by username */
app.get("/api/exercise/user/:name", async (req, res) => {
  const name = req.params.name;
  const user = await User.findOne({ username: name });
  if (user) {
    return res.json(user);
  }
  return res.send("There is no such user.");
});

/** Add exercise entry for one user */
app.post("/api/exercise/add", async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (user) {
    let date = new Date();
    let new_log = {
      _id: req.body.userId,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: date.toDateString().toString()
    };
    if (req.body.date) {
      new_log.date = new Date(req.body.date).toDateString().toString();
    }
    user.log.push(new_log);
    await user.save();

    new_log.username = user.username;
    return res.json(new_log);
  }
  return res.send("There is no such user.");
});

/** Get full exercise log from a given user */
app.get("/api/exercise/log", async (req, res) => {
  const query = req.query;
  if (query.userId) {
    let user;
    try {
      user = await User.findById(query.userId).lean();
    } catch {
      return res.send("Cannot find userId");
    }
    if (query.from) {
      user.log = user.log.filter(function(el) {
        return Date.parse(el.date) >= Date.parse(query.from);
      });
    }
    if (query.to) {
      user.log = user.log.filter(function(el) {
        return Date.parse(el.date) <= Date.parse(query.to);
      });
    }
    if (query.limit) {
      user.log = user.log.slice(1, parseInt(query.limit) + 1);
    }
    user.count = user.log.length;
    delete user.__v;
    return res.json(user);
  }
  return res.send("Unknown userId");
});


/* Listening to specified port */
const port = process.env.PORT || 3000;
var listener = app.listen(port, function () {
  console.log(`Your app is listening on ${port}`);
});
