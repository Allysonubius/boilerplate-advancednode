"use strict";

module.exports = function (app, db) {
  var passport = require("passport");

  var bcrypt = require("bcrypt");

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect("/");
  }

  app.use(session({
    secret: process.env.MONGO_URI,
    resave: true,
    saveUninitialized: true
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
        password: hash
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
  app.route("/auth/github").get(passport.authenticate("github"), function (req, res) {
    res.redirect("profile");
  });
  app.route("/auth/github/callback").get(passport.authenticate("github", {
    failureRedirect: "/"
  }), function (req, res) {
    res.redirect("profile");
  });
};