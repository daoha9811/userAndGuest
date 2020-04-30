const path = require("path");
const root = path.dirname(require.main.filename);
const shortid = require("shortid");

let db = require(root + "/db.model.js");

module.exports.checkSession = (req, res, next) => {
  if (!req.signedCookies.sessionId) {
    const id = shortid.generate();
    res.cookie("sessionId", id, {
      signed: true
    });
    db.get("Sessions")
      .push({
        sessionId: id
      })
      .write();
  }
  next();
};

