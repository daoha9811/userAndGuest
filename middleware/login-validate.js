const path = require("path");
const root = path.dirname(require.main.filename);
const bcrypt = require("bcrypt");
const salt = 10;
const moment = require('moment');

let wrongLoginCount = 0;
let loginFail = [];

let db = require(root + "/db.model.js");

module.exports.checkLogin = (req, res, next) => {
  const gmail = req.body.gmail;
  const password = req.body.password;
  let Errors = [];

  if(wrongLoginCount >= 4) {
    let present = moment();
    let theNextLoginTime = moment().add(2, 'm');
    loginFail.push(theNextLoginTime);
    let minuteToLogin = loginFail[0].diff(present, 'm'); 
    if(minuteToLogin > 0 ) {
      Errors.push(` Ban da dang nhap qua 4 lan thu lai sau ${minuteToLogin} phut `);
      res.render("authen/login", { Errors });
      return;
    } else {
      wrongLoginCount = 0;
      loginFail = [];
    }
  } else {
    if (
    !db
      .get("users")
      .find({ gmail: gmail })
      .value()
  ) {
    Errors.push("Khong tim thay gmail");
    ++wrongLoginCount;
    res.render("authen/login", { Errors });
    return;
  } else {
    if (
      !bcrypt.compareSync(
        password,
        db
          .get("users")
          .find({ gmail: gmail })
          .value().password
      )
    ) {
      Errors.push("Mat khau khong dung");
      ++wrongLoginCount;
      res.render("authen/login", { Errors });
      return;
    }
  }
  }
  next();
};

module.exports.isLogin = (req, res, next) => {
  if (!req.signedCookies.userId) {
    res.redirect("/login");
    return;
  }
  next();
};

module.exports.isSession = (req, res, next) => {
  if (!req.signedCookies.sessionId) {
    
  }
  next();
}