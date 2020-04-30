const path = require("path");
const root = path.dirname(require.main.filename);
const toPairs = require("lodash").toPairs;

const db = require(root + "/db.model.js");

module.exports.getCard = (req, res) => {
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

  //config data

  const obj =
    db
      .get("Sessions")
      .find({ sessionId })
      .value().carts || {};

  //   const arrayKeys = [];

  //   for(let i in obj) {
  //     arrayKeys.push({
  //       [i]: obj[i]
  //     })
  //   }
  const arrayKeys = toPairs(obj);

  const filterData = arrayKeys.map(key => {
    return {
      ...db
        .get("books")
        .find({ id: key[0] })
        .value(),
      slg: key[1]
    };
  });

  let currentPage = parseInt(req.query.pages) || 1;
  let perpage = 3;
  let pages = Math.ceil(filterData.length / perpage);
  let start = (currentPage - 1) * perpage;
  let end = (currentPage - 1) * perpage + perpage;
  let next = currentPage + 1 < pages ? currentPage + 1 : pages;
  let previous = currentPage - 1 >= 1 ? currentPage - 1 : 1;

  res.render("carts/cart", {
    data: filterData.slice(start, end),
    count,
    pages,
    currentPage,
    next,
    previous,
    count
  });
};

module.exports.getAddToCard = (req, res) => {
  const bookId = req.params.id;
  const sessionId = req.signedCookies.sessionId;

  const count = db
    .get("Sessions")
    .find({ sessionId })
    .get(`carts.${bookId}`, 0)
    .value();

  db.get("Sessions")
    .find({ sessionId })
    .set(`carts.${bookId}`, count + 1)
    .write();

  console.log(
    db
      .get("Sessions")
      .find({ sessionId })
      .value()
  );
  res.redirect("/books");
};

module.exports.getDelete = (req, res) => {
  let bookId = req.params.id;
  let sessionId = req.signedCookies.sessionId || "";
  let carts = db
    .get("Sessions")
    .find({ sessionId })
    .value().carts;
  delete carts[bookId];
  db.get("Sessions")
    .find({ sessionId })
    .assign({ carts })
    .write();
  res.redirect("back");
};

module.exports.getPay = (req, res) => {
  res.send('da vao trang pay')
}