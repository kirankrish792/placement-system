const express = require('express');
const app = express();
const port = 80;
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;



const Student = require('./model/student');


// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/placement', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionConfig = {
    name: 'session',
    secret:"ahgsdjsgfjgsdjgfjshdfkhfk",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
// app.use(passport.session());

passport.use(new LocalStrategy(Student.authenticate()));
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());





app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})



app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.render("dashboard", { user: req.user });
});

app.get("/dashboard", (req, res) => {
    console.log(req.user);
    // res.render("dashboard", { user: req.user });
});


app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new Student({ username, email });
        const registeredUser = await Student.register(user, password);
        res.redirect("/login");
    } catch (err) {
        console.log(err);
        res.redirect("/signup");
    }
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));