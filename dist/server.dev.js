"use strict";

var express = require("express");

var bodyParser = require("body-parser");

var fccTesting = require("./freeCodeCamp/fcctesting.js");

var session = require("express-session");

var passport = require("passport");

var LocalStrategy = require("passport-local");

var ObjectID = require("mongodb").ObjectID;

var mongo = require("mongodb").MongoClient;

var bcrypt = require("bcrypt");

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
    var ensureAuthenticated = function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }

      res.redirect("/");
    };

    console.log("Successful database connection");
    var db = client.db("passport");
    passport.serializeUser(function (user, done) {
      done(null, user._id);
    });
    passport.deserializeUser(function (id, done) {
      db.collection("users").findOne({
        _id: new ObjectID(id)
      }, function (err, doc) {
        done(null, doc);
      });
    });
    passport.use(new LocalStrategy(function (username, password, done) {
      db.collection("users").findOne({
        username: username
      }, function (err, user) {
        console.log("User " + username + " attempted to log in.");

        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (password !== user.password) {
          return done(null, false);
        }

        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false);
        }

        return done(null, user);
      });
    }));
    app.route("/").get(function (req, res) {
      res.render(process.cwd() + "/views/pug/index", {
        title: "Home Page",
        message: "Please login",
        showLogin: true,
        showRegistration: true
      });
    });
    app.route("/login").post(passport.authenticate("local", {
      failureRedirect: "/"
    }), function (req, res) {
      res.redirect("/profile");
    });
    app.route("/profile").get(ensureAuthenticated, function (req, res) {
      res.render(process.cwd() + "/views/pug/profile", {
        username: req.user.username
      });
    });
    app.route("/logout").get(function (req, res) {
      req.logout();
      res.redirect("/");
    });
    app.route("/register").post(function (req, res, next) {
      db.collection("users").findOne({
        username: req.body.username
      }, function (err, user) {
        if (err) next(err);
        if (user) return res.redirect("/");
        var hash = bcrypt.hashSync(req.body.password, 12);
        db.collection("users").insertOne({
          username: req.body.username,
          password: req.body.password
        }, function (err, doc) {
          if (err) next(err);
          next(null, doc);
        });
      });
    }, passport.authenticate("local", {
      failureRedirect: "/"
    }), function (req, res, next) {
      res.redirect("/profile");
    });
    app.use(function (req, res) {
      res.status(400).type("text").send("Not Found");
    });
    app.listen(process.env.PORT, function () {
      console.log("Listening on localhost:" + process.env.PORT);
    });
  }
});