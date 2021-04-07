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
          console.log();
          _context.next = 8;
          return regeneratorRuntime.awrap(callback(client));

        case 8:
          _context.next = 16;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.log();
          console.error('Database disconected' + _context.t0);
          console.log();
          throw new Error('Unable to Connect to Database');

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
}

module.exports = main;