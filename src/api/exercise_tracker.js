/** Tracking exercises for each users */

const User = require("../database/exercise_db.js").User;

/** Create a new user with unique username 
 * Use "username" in the form field as name
 * Only create user when the name is new.
*/
async function createUsers(req, res) {
  const name = req.body.username;
  const instance = await User.findOne({ username: name });
  if (!instance) {
    const new_user = new User({ username: name });
    await new_user.save();
    return res.json({
      username: name,
      _id: new_user._id
    });
  }
  return res.json({
    username: name
  });
}

/** Get all user data in an array */
async function getAllUsers(_req, res) {
  const users = await User.find();
  if (users) {
    return res.json(users);
  }
  return res.send("There is no user.");
}

/** Get user data by username */
async function getUserByName(req, res) {
  const name = req.params.name;
  const user = await User.findOne({ username: name });
  if (user) {
    return res.json(user);
  }
  return res.send("There is no such user.");
}

/** Add exercise entry for one user */
async function addExercise(req, res) {
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
}

/** Get full exercise log from a given user */
async function getFullExercise(req, res) {
  const query = req.query;
  if (query.userId) {
    let user;
    try {
      user = await User.findById(query.userId).lean();
    } catch {
      return res.send("Cannot find userId");
    }
    if (query.from) {
      user.log = user.log.filter((el) => {
        const from = new Date(query.from).toUTCString().split(' ').slice(1, 4);
        return Date.parse(el.date) >= Date.parse(from);
      });
    }
    if (query.to) {
      user.log = user.log.filter((el) => {
        const to = new Date(query.to).toUTCString().split(' ').slice(1, 4);
        return Date.parse(el.date) <= Date.parse(to);
      });
    }
    if (query.limit) {
      user.log = user.log.slice(0, parseInt(query.limit));
    }
    user.count = user.log.length;
    delete user.__v;
    return res.json(user);
  }
  return res.send("No userId specified");
}

module.exports = {
  createUsers: createUsers,
  getAllUsers: getAllUsers,
  getUserByName: getUserByName,
  addExercise: addExercise,
  getFullExercise: getFullExercise
}