const express = require("express");
const router = express.Router();
const path = require("path");
const root = path.dirname(require.main.filename);

const db = require(root + "/db.model.js");

const loginController = require(root + "/controllers/login.controller");
const loginMiddleware = require(root + "/middleware/login-validate");

router.get("/", loginController.getLogin);

router.post("/",loginMiddleware.checkLogin, loginController.postLogin);

module.exports = router;
