"use strict";

require('dotenv').config();

var passport = require("passport");

var LocalStrategy = require("passport-local");

var ObjectID = require("mongodb").ObjectID;

var bcrypt = require("bcrypt");

var GitHubStrategy = require("passport-github").Strategy;

module.exports = function (app, MongoDB) {
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });
  passport.deserializeUser(function (id, done) {
    MongoDB.collection("users").findOne({
      _id: new ObjectID(id)
    }, function (err, doc) {
      done(null, doc);
    });
  });
  passport.use(new LocalStrategy(function (username, password, done) {
    databaseMongo.findOne({
      username: username
    }, function (err, user) {
      console.log('User ' + username + ' attempted to log in.');

      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false);
      }

      return done(null, user);
    });
  }));
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: " http://localhost:3000/auth/github/callback"
  }, function (accessToken, refreshToken, profile, cb) {
    console.log(profile); //Database logic here with callback containing our user object

    MongoDB.findAndModify({
      id: profile.id
    }, {}, {
      $setOnInsert: {
        id: profile.id,
        name: profile.displayName || "John Doe",
        photo: profile.photos[0].value || "",
        email: Array.isArray(profile.emails) ? profile.emails[0].value : 'No public email',
        created_on: new Date(),
        provider: profile.provider || ""
      },
      $set: {
        last_login: new Date()
      },
      $inc: {
        login_count: 1
      }
    }, {
      upsert: true,
      "new": true
    }, function (err, doc) {
      return cb(null, doc.value);
    });
  }));
};