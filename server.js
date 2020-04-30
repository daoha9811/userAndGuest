// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParse = require("cookie-parser");
var db = require("./db.model.js");

const _ = require("lodash");

const booksRouter = require("./routes/book.routes");
const usersRouter = require("./routes/users.routes");
const transactionsRouter = require("./routes/transactions.routes");
const loginRouter = require("./routes/login.routes");
const cartRouter = require("./routes/cart.routes");

const loginMiddleware = require("./middleware/login-validate");
const sessionMiddleware = require("./middleware/sessionId");

const shortid = require("shortid");

db.defaults({ posts: [], user: {}, count: 0 }).write();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(cookieParse(process.env.SECRET_COOKIE));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(sessionMiddleware.checkSession);

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
   response.render('index')
});



//login
app.use("/login", loginRouter);

app.get("/logout", (req, res) => {
  res.cookie("userId", "");
  const id = shortid.generate();
    res.cookie("sessionId", id, {
      signed: true
    });
    db.get("Sessions")
      .push({
        sessionId: id
      })
      .write();
  res.redirect("/login");
})

//books router
app.use("/books", booksRouter);

//users router
app.use("/users", loginMiddleware.isLogin, usersRouter);

//transactions router
app.use("/transactions", loginMiddleware.isLogin, transactionsRouter);

//cart router
app.use("/carts", cartRouter);

// app.get('/test', (req, res) => {
//   var data1 = {
//     id: '1a',
//     cart: {
//       'book1': 2,
//       'book2': 3
//     }
//   }
//   var data2 = {
//     id: '2a',
//     cart: {
//       'book1': 1,
//       'book2': 2,
//       'book3': 2
//     }
//   }
  
//   for(let i in data2.cart){
//     if(data1[i]){
//       data1.cart[i] += data2.cart[i]
//     } else {
//       data1.cart[i] = data2.cart[i]
//     }
//   }
  
//   res.json(data1);

// })


// listen for requests :)
app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT);
});
