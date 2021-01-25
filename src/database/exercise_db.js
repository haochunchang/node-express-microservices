var mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [{
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: String
  }]
});

UserSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.__v;
  return obj;
}

let User = mongoose.model('User', UserSchema);
exports.User = User;