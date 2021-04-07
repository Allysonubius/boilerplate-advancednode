'use strict';
require('dotenv').config();
const express = require('express');
const mongo = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');
const auth = require('./auth.js');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('view engine', 'pug');

fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());

mongo(async(client) => {
    const MongoDB = await client.db('passport').collection('users');

    routes(app, MongoDB);
    auth(app, MongoDB);

    io.on('connection', (socket) => {
        console.log('A user has connected');
    });
}).catch((e) => {
    app.route('/').get((req, res) => {
        res.render('pug', { title: e, message: 'Unable to login' });
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log();
    console.log('Open in web browser localhost:' + process.env.PORT);
});