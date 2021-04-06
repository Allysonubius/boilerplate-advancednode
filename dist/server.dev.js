"use strict";

var express = require("express");

var bodyParser = require("body-parser");

var fccTesting = require("./freeCodeCamp/fcctesting.js");

var session = require("express-session");

var passport = require("passport");

var mongo = require("mongodb").MongoClient;

var routes = require('./routes');

var auth = require('./auth.js');

var app = express();

require("dotenv").config();

fccTesting(app); //For FCC testing purposes

app.use("/public", express["static"](process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "pug");
app.use(session({
  secret: "abc",
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
mongo.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function (err, client) {
  if (err) {
    console.log("Database error: " + err);
  } else {
    console.log("Successful database connection");
    var db = client.db("passport");
    auth(app, db);
    routes(app, db);
    app.use(function (req, res) {
      res.status(400).type("text").send("Not Found");
    });
    app.listen(process.env.PORT, function () {
      console.log("Listening on localhost:" + process.env.PORT);
    });
  }
});