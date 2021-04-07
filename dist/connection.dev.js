"use strict";

// Do not change this file
require('dotenv').config();

var _require = require('mongodb'),
    MongoClient = _require.MongoClient;

function main(callback) {
  var URI, client;
  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          URI = process.env.MONGO_URI; // Declare MONGO_URI in your .env file

          client = new MongoClient('mongodb+srv://allyson:78451278@cluster0.n5kla.mongodb.net/teste_05?retryWrites=true&w=majority');
          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(client.connect());

        case 5:
          console.log();
          console.log('Database connected'); // Make the appropriate DB calls

          _context.next = 9;
          return regeneratorRuntime.awrap(callback(client));

        case 9:
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](2);
          // Catch any errors
          console.error('Database disconected' + _context.t0);
          throw new Error('Unable to Connect to Database');

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 11]]);
}

module.exports = main;