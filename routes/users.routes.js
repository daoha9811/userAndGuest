const express = require("express");
const path = require("path");
const root = path.dirname(require.main.filename); // /app
const router = express.Router();

const multer = require("multer");

var upload = multer({ dest: root + '/public/uploads' });

const usersController = require(root + "/controllers/users.controller");
const usersMiddleware = require(root + "/middleware/users-validate.js");

router.get("/", usersController.get);

router.get("/create", usersController.getCreate);

router.post(
  "/create",
  upload.single("avatar"),
  usersMiddleware.check,
  usersController.postCreate
);

router.get("/search", usersController.getSearch);

router.get("/:id/delete", usersController.getDelete);

router.get("/:id/update", usersController.getUpdate);

router.post(
  "/:id/update",
  upload.single("avatar"),
  usersMiddleware.checkDetail,
  usersController.postUpdate
);

module.exports = router;
