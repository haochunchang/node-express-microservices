require('dotenv').config();
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var app = express();
app.use(cors({optionsSuccessStatus: 200}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  '/public',
  express.static(`${process.cwd()}/public`)
);

app.get("/", (_req, res) => {
  return res.sendFile(process.cwd() + '/views/index.html');
});

var routes = require('./routes.js');
app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on ${port}`);
});

module.exports = app;