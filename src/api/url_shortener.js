/** Shorten URL to a hash string */
const dns = require('dns');
const sha1 = require('js-sha1');

const URL = require("../database/url_db.js").URLModel;
const createAndSaveURL = require("../database/url_db.js").createAndSaveURL;

/** Create a new short URL for given URL */
function shortenURL(req, res) {
  const original_url = req.body.url;
  const hostname = original_url
    .replace(/http[s]?\:\/\//, '')
    .replace(/\/(.+)?/, '');

  dns.lookup(hostname, (err, address) => {
    if (err || !address) return res.json({ error: 'invalid url' });
    const url = {
      original_url: original_url,
      short_url: sha1(original_url).slice(0, 5)
    };
    createAndSaveURL(url, (err, _data) => {
      if (err) {
        return res.sendStatus(500);
      } else {
        return res.json(url);
      }
    });
  });
}

/** Redirect to original URL given short URL */
async function redirect(req, res) {
  const route = req.params.route;
  const instance = await URL.findOne({short_url: route});
  if (instance) {
    return res.redirect(`${instance.original_url}`);
  } else {
    return res.json({ error: 'invalid url' });
  }
}

module.exports = {
  shortenURL: shortenURL,
  redirect: redirect
}