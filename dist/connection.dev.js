"use strict";

// Do not change this file
require('dotenv').config();

var _require = require('mongodb'),
    MongoClient = _require.MongoClient;

var URI = process.env.MONGO_URI; // Declare MONGO_URI in your .env file

var client = new MongoClient('mongodb+srv://allyson:78451278@cluster0.n5kla.mongodb.net/teste_05?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function main(callback) {
  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(client.connect());

        case 3:
          console.log();
          console.log('Database connected');
          _context.next = 7;
          return regeneratorRuntime.awrap(callback(client));

        case 7:
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.error('Database disconected' + _context.t0);
          throw new Error('Unable to Connect to Database');

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
}

module.exports = main;