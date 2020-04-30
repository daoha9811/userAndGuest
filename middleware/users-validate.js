const path = require("path");
const root = path.dirname(require.main.filename);

let db = require(root + "/db.model.js");

module.exports.check = (req, res, next) => {
  let userName = req.body.name;
  let userGmail = req.body.gmail;
  let errors = [];

  if (userName.length >= 30) {
    errors.push("Name phai nho hon 30 ky tu");
    res.render("users/user-create", { Errors: errors });
    return;
  }

  if (
    db
      .get("users")
      .find({ gmail: userGmail })
      .value()
  ) {
    errors.push("Gmail da duoc dang ky");
    res.render("users/user-create", { Errors: errors });
    return;
  }

  next();
};

module.exports.checkDetail = (req, res, next) => {
  let userName = req.body.name;
  let userGmail = req.body.gmail;
  let userPassword = req.body.password;
  let errors = [];

  if (userName.length >= 30) {
    errors.push("Name phai nho hon 30 ky tu");
    res.render("users/user-detail", { Errors: errors });
    return;
  }

  if (
    db
      .get("users")
      .find({ gmail: userGmail })
      .value()
  ) {
    errors.push("Gmail da duoc dang ky");
    res.render("users/user-detail", {
      Errors: errors,
      data: {
        name: userName,
        gmail: userGmail,
        password: userPassword,
        id: req.body.id
      }
    });
    return;
  }

  next();
};
