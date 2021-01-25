var mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: String
});
let URL = mongoose.model('URL', urlSchema);

const createAndSaveURL = (url, done) => {
  let new_url = new URL(url);
  new_url.save(function(err, data) {
    if (err) return done(err);
    done(null, data);
  });
};

exports.URLModel = URL;
exports.createAndSaveURL = createAndSaveURL;