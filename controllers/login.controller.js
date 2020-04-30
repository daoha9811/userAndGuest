const path = require("path");
const root = path.dirname(require.main.filename);

const db = require(root + "/db.model.js");

module.exports.getLogin = (req, res) => {
  let sessionId = req.signedCookies.sessionId || "";
  //lay count de hien len views
  let count =
    Object.values(
      db
        .get("Sessions")
        .find({ sessionId })
        .value().carts
        ? db
            .get("Sessions")
            .find({ sessionId })
            .value().carts
        : {}
    ).reduce((a, b) => a + b, 0) || 0;

  res.render("authen/login", { Errors: [], count });
};

module.exports.postLogin = (req, res) => {
  const guestSSID = req.signedCookies.sessionId;
  const id = db
    .get("users")
    .find({ gmail: req.body.gmail })
    .value().id;
  res.cookie("userId", id, {
    signed: true
  });
  //check xem trong database da co session cua user nay chua
  if (
    !db
      .get("Sessions")
      .find({ sessionId: id })
      .value()
  ) {
    db.get("Sessions")
      .push({
        sessionId: id
      })
      .write();
  }
  //logic xu ly exchange du lieu giua guest va user
  if (guestSSID && guestSSID != id) {
    //exchange du lieu
    let guestSessions = db
      .get("Sessions")
      .find({ sessionId: guestSSID })
      .value();
    let userSessions = db
      .get("Sessions")
      .find({ sessionId: id })
      .value();

    if(guestSessions.carts) {
      for (let i in guestSessions.carts) {
        if (userSessions["carts"][i]) {
          userSessions["carts"][i] += guestSessions["carts"][i];
        } else {
          userSessions["carts"][i] = guestSessions["carts"][i];
        }
      }
    }
    //write lai trong db
    db.get("Sessions")
      .find({ sessionId: id })
      .assign({ carts: userSessions['carts'] })
      .write();
  }
  res.cookie("sessionId", id, {
    signed: true
  });

  res.redirect("/users");
};
