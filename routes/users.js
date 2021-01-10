var express = require('express');
var router = express.Router();
var hash = require('pbkdf2-password')()
const User = require('../models').User;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    session: req.session,
    name: req.session.user || 'no user'
  });
});

function authentication(username, password, fn) {
  const salt = 'rifqikeren';

  hash({
    password: password,
    salt: salt,
  }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (password == password) return fn(null, username);
    fn(new Error('invalid password'));
  })
}

/* POST users login. */
router.post('/', function (req, res, next) {
  const username = req.body.username,
        password = req.body.password;

  authentication(username, password, function(err, user) {
    if (err) return res.json({error : 'error'});
    req.session.regenerate(() => {
      req.session.user = user;

      res.json({
        session: req.session.user
      })
    });

  });
});

router.post('/register', async (req, res, next) => {
    res.json(req.body);
    // let create = await User.create(req.body);

    // res.json(create);
});


module.exports = router;
