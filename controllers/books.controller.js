const path = require("path");
const root = path.dirname(require.main.filename); // /app
const shortid = require("shortid");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

let db = require(root + "/db.model.js");

module.exports.get = (req, res) => {
  let q = req.query.q || "";
  let isAdmin = false;
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
  //logic kiem tra xem co phai admin khong
  const userId = req.signedCookies.userId || "";
  if (userId) {
    if (
      db
        .get("users")
        .find({ id: userId })
        .value().isAdmin
    ) {
      isAdmin = true;
    }
  }
  let currentPage = parseInt(req.query.pages) || 1;
  let perpage = 6;
  let pages = Math.ceil(db.get("books").value().length / perpage);
  let start = (currentPage - 1) * perpage;
  let end = (currentPage - 1) * perpage + perpage;
  let next = currentPage + 1 < pages ? currentPage + 1 : pages;
  let previous = currentPage - 1 >= 1 ? currentPage - 1 : 1;
  let filterData = db
    .get("books")
    .value()
    .slice(start, end);
  res.render("books/books", {
    data: filterData,
    pages,
    currentPage,
    next,
    previous,
    isAdmin,
    count
  });
};

module.exports.getSearch = (req, res) => {
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
  let q = req.query.q || "";
  let isAdmin = false;
  //logic kiem tra xem co phai admin khong
  const userId = req.signedCookies.userId || "";
  if (userId) {
    if (
      db
        .get("users")
        .find({ id: userId })
        .value().isAdmin
    ) {
      isAdmin = true;
    }
  }
  let currentPage = parseInt(req.query.pages) || 1;
  let filterData = db
    .get("books")
    .value()
    .filter(d => {
      return d.title.toLowerCase().indexOf(q.toLowerCase()) != -1;
    });
  let perpage = 3;
  let pages = Math.ceil(filterData.length / perpage);
  let start = (currentPage - 1) * perpage;
  let end = (currentPage - 1) * perpage + perpage;
  let next = currentPage + 1 < pages ? currentPage + 1 : pages;
  let previous = currentPage - 1 >= 1 ? currentPage - 1 : 1;
  res.render("books/book-search", {
    data: filterData.slice(start, end),
    pages,
    currentPage,
    next,
    previous,
    q,
    isAdmin,
    count
  });
};

module.exports.getCreate = (req, res) => {
  res.render("books/book-create");
};

module.exports.postCreate = async (req, res) => {
  let { title, description } = req.body;
  if (!req.file) {
    if (title) {
      db.get("books")
        .push({
          id: shortid.generate(),
          title,
          description,
          coverUrl:
            "https://res.cloudinary.com/daoha/image/upload/v1588146078/userTest/download_btdqvy.jpg"
        })
        .write();
    }
  } else {
    const id = shortid.generate();
    const path = req.file.path;
    await cloudinary.uploader.upload(
      path,
      { public_id: `booksTest/${id}`, width: 300, height: 300 },
      (err, result) => {
        if (err) {
          console.warn(err);
        }
        db.get("books")
          .push({ id: id, title, description, coverUrl: result.url })
          .write();
      }
    );
  }
  res.redirect("/books");
};

module.exports.getDelete = (req, res) => {
  let params = req.params.id;
  db.get("books")
    .remove({ id: params })
    .write();
  res.redirect("back");
};

module.exports.getUpdate = (req, res) => {
  let params = req.params.id;
  res.render("books/book-detail", {
    data: db
      .get("books")
      .find({ id: params })
      .value()
  });
};

module.exports.postUpdate = async (req, res) => {
  let params = req.params.id;
  let { title, description } = req.body;
  if (!req.file) {
    db.get("books")
      .find({ id: params })
      .assign({ title, description })
      .write();
  } else {
    const path = req.file.path;
    await cloudinary.uploader.upload(
      path,
      { public_id: `booksTest/${params}`, width: 300, height: 300 },
      (err, result) => {
        if (err) {
          console.warn(err);
        }
        db.get("books")
          .find({ id: params })
          .assign({ title, description, coverUrl: result.url })
          .write();
      }
    );
  }
  res.redirect("/books");
};
