"use strict";
require("dotenv").config();
const express = require("express");
const MongoDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes");
const auth = require("./auth.js");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const passportSocketIo = require("passport.socketio");
const cookieParser = require("cookie-parser");

app.set("view engine", "pug");

fccTesting(app); // For fCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.MONGO_URI,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    key: "express.sid"
  })
);
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "exoress.sid",
    secret: process.env.MONGO_URI,
    success: onAuthorizeSucess,
    fail: onAuthorizeFail
  })
);

app.use(passport.initialize());
app.use(passport.session());

MongoDB(async (client) => {
  const myDataBase = await client.db("passport").collection("users");

  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;
  io.on("connection", (socket) => {
    ++currentUsers;
    io.emit("user count", currentUsers);
    console.log("A user has connected");

    socket.on("disconnect", () => {
      console.log("A user has disconnected");
      --currentUsers;
      io.emit("user count", currentUsers);
    });
  });
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("pug", { title: e, message: "Unable to login" });
  });
});

function onAuthorizeSucess(data, accept) {
  console.log("Sucessful connection to socket.io");
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log("Failed connection to socket.io: ", message);
  accept(null, false);
}

http.listen(process.env.PORT, () => {
  console.log("Open in browser https://localhost:3000" + process.env.PORT);
});
