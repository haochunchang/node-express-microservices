/** Analyze uploaded files */
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(_req, _file, cb) {
    cb(null, 'uploads/');
  },

  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

/** Get metadata of uploaded files */
function getFileMetadata(req, res) {
  var upload = multer({ storage: storage }).single('upfile');
  upload(req, res, () => {
    return res.json({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    })
  });
}

module.exports = {
  getFileMetadata: getFileMetadata,
}