const express = require("express");
const path = require("path");
const root = path.dirname(require.main.filename); // /app
const router = express.Router();

const multer = require("multer");

var upload = multer({ dest: root + "/public/uploads" });

const bookController = require(root + "/controllers/books.controller");

router.get("/", bookController.get);

router.get("/create", bookController.getCreate);

router.post("/create", upload.single("avatar"), bookController.postCreate);

router.get("/search", bookController.getSearch);

router.get("/:id/delete", bookController.getDelete);

router.get("/:id/update", bookController.getUpdate);

router.post("/:id/update", upload.single("avatar"), bookController.postUpdate);

module.exports = router;
