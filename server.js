import express from 'express';
import session from 'express-session';
import * as path from 'path';
import router from './router.js';
import passport from "passport";
import LocalStrategy from "passport-local";
import bodyParser from 'body-parser';
import mysql from "mysql";
import Storage from "session-file-store";
import bcrypt from "bcryptjs";
import {MYSQL_OPTIONS} from "./constants.js";


const __dirname = path.resolve();

const PORT = process.env.PORT ??  3000
const app = express();

export const pool = mysql.createPool({
    ...MYSQL_OPTIONS,
    connectionLimit: 10
});

app.set ('view engine', 'ejs');
app.set ('views', path.resolve(__dirname, 'templates'));

passport.use(new LocalStrategy({usernameField: 'email'}, function verify(email, password, cb) {
    const con = mysql.createConnection(MYSQL_OPTIONS)
    con.connect(err => {
        if (err) {
            console.log(err);
            return err;
        }
    });
    con.query('SELECT * FROM user WHERE email = ? and status = 1 limit 1', [ email ], function(err, users) {
        if (err) { return cb(err); }

        if (users.length === 0) {
            return cb(null, false, { message: 'No such user' });
        }
        const user = users[0];
        if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }); }

        if (!~bcrypt.compare(user.password, password)) {
            return cb(null, false, { message: 'Incorrect username or password.' });
        }
        return cb(null, user);
    });
}));
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
    const con = mysql.createConnection(MYSQL_OPTIONS)
    con.connect(err => {
        if (err) {
            return null;
        }
    });
    con.query('SELECT * FROM user WHERE id = ? and status = 1 limit 1', [ id ], function(err, users) {
        if (err) { return null; }
        if (users.length === 0) {
            return done(null, null);
        }
        return done(null, users[0])
    });

})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new (Storage(session))({path: './sessions'})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(router);

app.listen(PORT, () => {
    console.log('App starting')
})

