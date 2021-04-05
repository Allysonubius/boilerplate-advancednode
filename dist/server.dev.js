'use strict';

require('dotenv').config();

var express = require('express');

var myDB = require('./connection');

var fccTesting = require('./freeCodeCamp/fcctesting.js');

var session = require('express-session');

var passport = require('passport');

var ObjectID = require('mongodb').ObjectID;

var LocalStrategy = require("passport-local");

var app = express();
app.set('view engine', 'pug');
fccTesting(app); //For FCC testing purposes

app.use('/public', express["static"](process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));
app.use(passport.initialize());
app.use(passport.session());
myDB(function _callee(client) {
  var myDataBase, ensureAuthenticated;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          ensureAuthenticated = function _ref(req, res, next) {
            if (req.isAuthenticated()) {
              return next();
            }

            res.redirect("/");
          };

          _context.next = 3;
          return regeneratorRuntime.awrap(client.db('database').collection('users'));

        case 3:
          myDataBase = _context.sent;
          // Be sure to change the title
          app.route('/').get(function (req, res) {
            // Change the response to render the Pug template
            res.render('pug', {
              title: 'Connected to Database',
              message: 'Please login'
            });
          }); // Authentication Strategies

          passport.use(new LocalStrategy(function (username, password, done) {
            db.collection("users").findOne({
              username: username
            }, function (err, user) {
              console.log("User " + username + " attempted to log in.");
              if (err) return done(err);
              if (!user) return done(null, false);
              if (password !== user.password) return done(null, false);
              return done(null, user);
            });
          }));
          // Serialization and deserialization here...
          passport.serializeUser(function (user, done) {
            done(null, user._id);
          });
          passport.deserializeUser(function (id, done) {
            myDataBase.findOne({
              _id: new ObjectID(id)
            }, function (err, doc) {
              done(null, doc);
            });
          }); // How to Use Passport Strategies

          app.route("/").get(function (req, res) {
            res.render(process.cwd() + "/views/pug/index", {
              title: "Hello",
              message: "Please login",
              showLogin: true
            });
          });
          app.route("/login").post(passport.authenticate("local", {
            failureRedirect: "/"
          }), function (req, res) {
            res.redirect("/profile");
          });
          app.route("/profile").get(function (req, res) {
            res.render(process.cwd() + "/views/pug/profile");
          });

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
})["catch"](function (e) {
  app.route('/').get(function (req, res) {
    res.render('pug', {
      title: e,
      message: 'Unable to login'
    });
  });
}); // app.listen out here...

app.listen(process.env.PORT, function () {
  console.log();
  console.log('Open in browser localhost:' + process.env.PORT);
});