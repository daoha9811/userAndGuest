const express = require("express");
const path = require("path");
const root = path.dirname(require.main.filename); // /app
const router = express.Router();
const shortid = require("shortid");
let db = require(root + "/db.model.js");

const transController = require(root + "/controllers/transactions.controller");
const transMiddleware = require(root + "/middleware/transactions-validate.js")

router.get("/", transController.get);

router.get("/create", transController.getCreate);

router.post("/create", transController.postCreate);

router.get("/:userId/:bookId/delete",transMiddleware.checkId, transController.getBookDelete);



module.exports = router;
