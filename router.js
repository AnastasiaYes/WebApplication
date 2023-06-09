import {Router} from "express";
import passport from "passport"
import {pool} from "./server.js";
import bcrypt from "bcryptjs";

export function getPasswordHash(password) {
    return bcrypt.hashSync(password, 8);
}

const router = Router();

router.get('/api/server', (req, res) => {
    res.send({test: '/api/server'})
})

router.get('/', (req, res) => {
    res.render('index')
});


router.post('/register', async (req, res) => {

    if (!req.body) return res.send({ok: false, message: "Request invalid"});

    if (typeof req.body?.userName !== "string" || req.body?.userName === "") {
        return res.send({ok: false, message: "Username invalid"});
    }

    if (req.body?.userName.length > 14) {
        return res.send({ok: false, message: "Username invalid"});
    }

    const emailExpr = new RegExp(/^([a-z0-9._%+-]+)@([a-z0-9.-]+)\.([a-z]{2,})$/g);
    if (!emailExpr.test(req.body.email)) {
        return res.send({ok: false, message: "Email invalid"});
    }

    pool.query('SELECT email FROM user WHERE email = ?', [req.body.email], function (err, data) {
        if (err) {
            return res.send({ok: false, message: "Err server"});
        }
        if (data.length > 0) {
            return res.send({ok: false, message: "Email already exists"});
        }
        const passwordExpr = new RegExp(/^([a-zA-Z0-9*_!@#$%^&()]+)$/);
        if (!passwordExpr.test(req.body.password)) {
            return res.send({ok: false, message: "Password invalid"});
        }

        pool.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [req.body.userName, req.body.email, getPasswordHash(req.body.password)], (err) => {
            if (err) {
                return res.send({ok: false, message: "Err server"});
            }
            res.redirect('/');
        });
    });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/'
}), async  (req, res) => {
    pool.query(`UPDATE user SET last_login_date = CURDATE() WHERE id = ${req.user.id}`, function (err, rows) {
        return res.redirect('/users');
    });
});


router.get('/users', async (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }

    pool.query('SELECT * FROM user', function (err, rows) {

        let data = [];
        for (let i = 0; i < rows.length; i++) {
            data.push({
                ...rows[i],
                registration_date: rows[i].registration_date !== null ? new Intl.DateTimeFormat().format(rows[i].registration_date) : '',
                last_login_date: rows[i].last_login_date !== null ? new Intl.DateTimeFormat().format(rows[i].last_login_date) : ''
            })
        }

        return res.render('userList', {
            rows: data
        });
    });
});

router.post('/users/ban', async (req, res) => {
    if (!req.user) {
        return res.send({ok: false, message: "Unauthorized"});
    }

    const ids = req.body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.send({ok: false, message: "Param ids invalid"});
    }
    let isIdNumbers = ids.every(function (item) {
        return !Number.isNaN(Number(item));
    });
    if (!isIdNumbers) {
        return res.send({ok: false, message: "User id must be a number"});
    }

    pool.query('SELECT id FROM user WHERE id IN (?)', [ids], function (err, rows) {
        if (rows.length !== ids.length) {
            return res.send({ok: false, message: "Some users not found"});
        }

        pool.query('UPDATE user SET status = 0 WHERE id IN (?)', [ids], function (err, rows) {
            if (err) {
                console.log(err);
                return res.send({ok: false, message: "Server error"});
            }

            if (~ids.indexOf(req.user.id)) {
                req.session.destroy();
            }
            return res.send({ok: true, message: "Users successfully blocked"});
        });

    });

});

router.post('/users/unblock', async (req, res) => {
    if (!req.user) {
        return res.send({ok: false, message: "Unauthorized"});
    }

    const ids = req.body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.send({ok: false, message: "Param ids invalid"});
    }
    let isIdNumbers = ids.every(function (item) {
        return !Number.isNaN(Number(item));
    })
    if (!isIdNumbers) {
        return res.send({ok: false, message: "User id must be a number"});
    }

    pool.query('SELECT id FROM user WHERE id IN (?)', [ids], function (err, rows) {
        if (rows.length !== ids.length) {
            return res.send({ok: false, message: "Some users not found"});
        }

        pool.query('UPDATE user SET status = 1 WHERE id IN (?)', [ids], function (err, rows) {
            if (err) {
                console.log(err);
                return res.send({ok: false, message: "Server error"});
            }
            return res.send({ok: true, message: "Users successfully blocked"});
        });

    });

});

router.post('/users/del', async (req, res) => {
    if (!req.user) {
        return res.send({ok: false, message: "Unauthorized"});
    }

    const ids = req.body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.send({ok: false, message: "Param ids invalid"});
    }
    let isIdNumbers = ids.every(function (item) {
        return !Number.isNaN(Number(item));
    })
    if (!isIdNumbers) {
        return res.send({ok: false, message: "User id must be a number"});
    }

    pool.query('SELECT id FROM user WHERE id IN (?)', [ids], function (err, rows) {
        if (rows.length !== ids.length) {
            return res.send({ok: false, message: "Some users not found"});
        }

        pool.query('DELETE FROM user WHERE id IN (?)', [ids], function (err, rows) {
            if (err) {
                console.log(err)
                return res.send({ok: false, message: "A server error has occurred. Try again"});
            }
            return res.send({ok: true, message: "Users deleted successfully"});
        });
    });

});

export default router;