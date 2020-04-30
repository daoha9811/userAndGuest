const path = require("path");
const root = path.dirname(require.main.filename); // /app
const shortid = require("shortid");

let db = require(root + "/db.model.js");

module.exports.checkId = (req, res, next) => {
  const userId = req.params.userId;
  const bookId = req.params.bookId;

  if (
    db
      .get("users")
      .find({ id: userId })
      .value() &&
    db
      .get("books")
      .find({ id: bookId })
      .value()
  ) {
    next();
  } else {
    res.redirect("/transactions");
  }
};
