'use strict';

require('dotenv').config();

var express = require('express');

var mongo = require('./connection');

var fccTesting = require('./freeCodeCamp/fcctesting.js');

var session = require('express-session');

var passport = require('passport');

var routes = require('./routes');

var auth = require('./auth.js');

var app = express();

var http = require('http').createServer(app);

var io = require('socket.io')(http);

app.set('view engine', 'pug');
fccTesting(app); // For fCC testing purposes

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
mongo(function _callee(client) {
  var myDataBase;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(client.db('database').collection('users'));

        case 2:
          myDataBase = _context.sent;
          routes(app, myDataBase);
          auth(app, myDataBase);
          io.on('connection', function (socket) {
            console.log('A user has connected');
          });

        case 6:
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
});
http.listen(process.env.PORT || 3000, function () {
  console.log();
  console.log('Open in web browser localhost:' + process.env.PORT);
});