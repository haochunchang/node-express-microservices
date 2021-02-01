var express = require('express');
var router = express.Router();

var timestamp = require('./api/timestamp');
router.route('/timestamp/').get(timestamp.getCurrentTimestamp);
router.route('/timestamp/:date_string?').get(timestamp.getTimestamp);

var header_parser = require('./api/header_parser');
router.route('/whoami').get(header_parser.getHeader);

var shortURL = require('./api/url_shortener');
router.route('/shorturl/new').post(shortURL.shortenURL);
router.route('/shorturl/:route').get(shortURL.redirect);

var exercise = require('./api/exercise_tracker');
router.route('/exercise/new-user').post(exercise.createUsers);
router.route('/exercise/users').get(exercise.getAllUsers);
router.route('/exercise/user/:name').get(exercise.getUserByName);
router.route('/exercise/add').post(exercise.addExercise);
router.route('/exercise/log').get(exercise.getFullExercise);

var file_analyzer = require('./api/file_analyzer');
router.route('/fileanalyze').post(file_analyzer.getFileMetadata);

module.exports = router;