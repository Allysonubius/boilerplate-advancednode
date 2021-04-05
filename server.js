"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ObjectID = require("mongodb").ObjectID;
const mongo = require("mongodb").MongoClient;

const app = express();
require("dotenv").config();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug");

app.use(
    session({
        secret: "abc",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

mongo.connect(
    process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err, db) => {
        if (err) {
            console.log("Database error: " + err);
        } else {
            console.log("Successful database connection");

            passport.serializeUser((user, done) => {
                done(null, user._id);
            });

            passport.deserializeUser((id, done) => {
                db.collection("users").findOne({ _id: new ObjectID(id) },
                    (err, doc) => {
                        done(null, doc);
                    }
                );
            });
            passport.use(
                new LocalStrategy((username, password, done) => {
                    db.collection("users").findOne({ username: username }, function(
                        err,
                        user
                    ) {
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
                        return done(null, user);
                    });
                })
            );

            function ensureAuthenticated(req, res, next) {
                if (req.isAuthenticated()) {
                    return next();
                }
                res.redirect("/");
            }

            app.route("/").get((req, res) => {
                res.render(process.cwd() + "/views/pug/index", {
                    title: "Home Page",
                    message: "Please login",
                    showLogin: false,
                });
            });

            app
                .route("/login")
                .post(
                    passport.authenticate("local", { failureRedirect: "/" }),
                    (req, res) => {
                        res.redirect("/profile");
                    }
                );

            app.route("/profile").get(ensureAuthenticated, (req, res) => {
                res.render(process.cwd() + "/views/pug/profile", {
                    username: req.user.username,
                });
            });

            app.route("/logout").get((req, res) => {
                req.logout();
                res.redirect("/");
            });

            app.use((req, res) => {
                res.status(400).type("text").send("Not Found");
            });

            app.listen(process.env.PORT, () => {
                console.log("Listening on localhost:" + process.env.PORT);
            });
        }
    }
);