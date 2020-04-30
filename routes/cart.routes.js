const express = require("express");
const router = express.Router();
const path = require("path");
const root = path.dirname(require.main.filename); //app

const cartController = require(root + "/controllers/carts.controller");
const loginMiddleware = require(root + "/middleware/login-validate");

router.get("/", cartController.getCard);

router.get("/addToCart/:id", cartController.getAddToCard);

router.get("/:id/delete", cartController.getDelete);

router.get("/pay",loginMiddleware.isLogin, cartController.getPay);

module.exports = router;
