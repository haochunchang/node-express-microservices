/** Get browser header information */

function getHeader(req, res) {
  return res.json({
    "ipaddress": req.connection.remoteAddress,
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"]
  })
}

exports.getHeader = getHeader;