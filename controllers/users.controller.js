const path = require("path");
const root = path.dirname(require.main.filename); // /app
const shortid = require("shortid");
const bcrypt = require("bcrypt");
const salt = 10;
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

let db = require(root + "/db.model.js");

module.exports.get = (req, res) => {
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
  let currentPage = parseInt(req.query.pages) || 1;
  let perpage = 3;
  let pages = Math.ceil(db.get("users").value().length / perpage);
  let start = (currentPage - 1) * perpage;
  let end = (currentPage - 1) * perpage + perpage;
  let next = currentPage + 1 < pages ? currentPage + 1 : pages;
  let previous = currentPage - 1 >= 1 ? currentPage - 1 : 1;
  let filterData = db
    .get("users")
    .value()
    .slice(start, end);
  res.render("users/users", {
    data: filterData,
    currentPage,
    pages,
    previous,
    next,
    count
  });
};

module.exports.getSearch = (req, res) => {
  let q = req.query.q || "";
  let filterData = db
    .get("users")
    .value()
    .filter(d => {
      return d.name.toLowerCase().indexOf(q.toLowerCase()) != -1;
    });
  let currentPage = parseInt(req.query.pages) || 1;
  let perpage = 3;
  let pages = Math.ceil(filterData.length / perpage);
  let start = (currentPage - 1) * perpage;
  let end = (currentPage - 1) * perpage + perpage;
  let next = currentPage + 1 < pages ? currentPage + 1 : pages;
  let previous = currentPage - 1 >= 1 ? currentPage - 1 : 1;
  res.render("users/user-search", {
    data: filterData.slice(start, end),
    currentPage,
    pages,
    previous,
    next,
    q
  });
};

module.exports.getCreate = (req, res) => {
  res.render("users/user-create", {
    Errors: []
  });
};

module.exports.postCreate = (req, res) => {
  let { name, gmail, password } = req.body;
  //neu khong co file gui len thi imgUrl = mac dinh
  if (!req.file) {
    if (name) {
      bcrypt.hash(password, salt, (err, hash) => {
        db.get("users")
          .push({
            id: shortid.generate(),
            name,
            gmail,
            password: hash,
            imgUrl:
              "https://res.cloudinary.com/daoha/image/upload/v1588146078/userTest/download_btdqvy.jpg",
            isAdmin: false
          })
          .write();
      });
    }
  } else {
    //neu co file thi luu len cloudinary
    const id = shortid.generate();
    const path = req.file.path;
    cloudinary.uploader.upload(
      path,
      { public_id: `userTest/${id}`, width: 100, height: 100 },
      (err, result) => {
        if (err) {
          console.warn(err);
        }
        if (name) {
          bcrypt.hash(password, salt, (err, hash) => {
            db.get("users")
              .push({
                id,
                name,
                gmail,
                password: hash,
                imgUrl: result.url,
                isAdmin: false
              })
              .write();
          });
        }
      }
    );
  }
  res.redirect("/users");
};

module.exports.getDelete = (req, res) => {
  let params = req.params.id;
  db.get("users")
    .remove({ id: params })
    .write();
  db.get("transactions")
    .remove({ userId: params })
    .write();
  res.redirect("back");
};

module.exports.getUpdate = (req, res) => {
  let params = req.params.id;
  res.render("users/user-detail", {
    data: db
      .get("users")
      .find({ id: params })
      .value(),
    Errors: []
  });
};

module.exports.postUpdate = async (req, res) => {
  let params = req.params.id;
  let { name, password, gmail } = req.body;
  const hash = bcrypt.hashSync(password, salt);
  if (!req.file) {
    db.get("users")
      .find({ id: params })
      .assign({ name, password: hash, gmail })
      .write();
  } else {
    const path = req.file.path;
    await cloudinary.uploader.upload(
      path,
      { public_id: `userTest/${params}`, width: 100, height: 100 },
      (err, result) => {
        if (err) {
          console.warn(err);
        }
        console.log(result);
        db.get("users")
          .find({ id: params })
          .assign({ name, password: hash, gmail, imgUrl: result.url })
          .write();
      }
    );
  }
  res.redirect("/users");
};
