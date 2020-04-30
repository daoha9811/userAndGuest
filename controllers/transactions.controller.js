const path = require("path");
const root = path.dirname(require.main.filename); // /app
const shortid = require("shortid");
const cloneDeep = require("lodash").cloneDeep;

let db = require(root + "/db.model.js");

module.exports.get = (req, res) => {
  let userId = req.signedCookies.userId;
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
  //config lai data
  //isAdmin == true
  if (
    db
      .get("users")
      .find({ id: userId })
      .value().isAdmin
  ) {
    let currentPage = parseInt(req.query.pages) || 1;
    let perpage = 3;
    let pages = Math.ceil(db.get("transactions").value().length / perpage);
    let start = (currentPage - 1) * perpage;
    let end = (currentPage - 1) * perpage + perpage;
    let next = currentPage + 1 < pages ? currentPage + 1 : pages;
    let previous = currentPage - 1 >= 1 ? currentPage - 1 : 1;
    let filterData = cloneDeep(db.get("transactions").value())
      .map(d => {
        d.userName = db
          .get("users")
          .find({ id: d.userId })
          .value().name;
        d.bookName = d.bookId.map(b => {
          return db
            .get("books")
            .find({ id: b })
            .value().title;
        });
        return d;
      })
      .slice(start, end);
    res.render("transactions/transaction", {
      data: filterData,
      isAdmin: true,
      currentPage,
      pages,
      next,
      previous,
      count
    });
  } else {
    let filterData =
      cloneDeep(
        db
          .get("transactions")
          .find({ userId: userId })
          .value()
      ) || {};
    filterData.userName = db
      .get("users")
      .find({ id: userId })
      .value().name;
    if (filterData.bookId) {
      filterData.bookName = filterData.bookId.map(b => {
        return db
          .get("books")
          .find({ id: b })
          .value().title;
      });
    } else {
      filterData.bookName = [];
      filterData.bookId = [];
    }
    res.render("transactions/transaction", {
      data: [filterData],
      isAdmin: false,
      count
    });
  }
};

module.exports.postCreate = (req, res) => {
  let user = req.body.user;
  let book = req.body.book;
  if (
    db
      .get("transactions")
      .find({ userId: user })
      .value()
  ) {
    if (
      checkBook(
        db
          .get("transactions")
          .find({ userId: user })
          .value().bookId,
        book
      )
    ) {
      res.send("Da co sach roi");
    } else {
      let books = db
        .get("transactions")
        .find({ userId: user })
        .value().bookId;
      books.push(book);
      db.get("transactions")
        .find({ userId: user })
        .assign({ bookId: books })
        .write();
      res.redirect("/transactions");
    }
  } else {
    db.get("transactions")
      .push({
        id: shortid.generate(),
        userId: user,
        bookId: [book],
        isComplete: false
      })
      .write();
    res.redirect("/transactions");
  }
};

module.exports.getCreate = (req, res) => {
  res.render("transactions/transaction-create", {
    users: db.get("users").value(),
    books: db.get("books").value()
  });
};

module.exports.getBookDelete = (req, res) => {
  const userId = req.params.userId;
  const bookId = req.params.bookId;
  let books = db
    .get("transactions")
    .find({ userId: userId })
    .value()
    .bookId.filter(i => {
      return i !== bookId;
    });

  db.get("transactions")
    .find({ userId: userId })
    .assign({ bookId: books })
    .write();
  res.redirect("back");
};

function checkBook(books, book) {
  if (books.indexOf(book) !== -1) {
    return true;
  } else {
    return false;
  }
}
