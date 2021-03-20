var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
const UserModel = require('../models').User;
const { route } = require('.');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../config/configJwt');
var jwtMiddleware = require('../app/middleware/jwt');

/* GET users listing. */
router.get('/', jwtMiddleware, async function(req, res, next) {
  let user = await UserModel.findOne({
    where : { id: req.userId }
  });

  res.status(200).send({
    msg: `Selamat datang ${user.username}`
  });
});

router.post('/register', async (req, res, next) => {
    // res.json(req.body);
    let user = {
      username : req.body.username,
      password : bcrypt.hashSync(req.body.password, 8),
      image: req.body.image,
    };

    let validation = await UserModel.findOne({
      where : {
        username: user.username
      }
    });

    if (validation) {
      res.status(200).json({
        msg: 'Username already exists'
      });

      return false;
    }

    let userCreate = await UserModel.create(user);
    res.status(200).json({
      msg: 'User successfully created',
      data : userCreate
    });
}); 

router.post('/authentication', async (req, res, next) => {
    let user = {
      username : req.body.username,
      password : req.body.password
    };

    let userData = await UserModel.findOne({
      where : { username : user.username }
    });

    if (userData) {
      let isValidPassword = bcrypt.compareSync(user.password, userData.password);
      if (!isValidPassword) {
        res.status(401).send({
          auth: false,
          msg: 'ERR',
          error: 'Invalid Password'   
        });
        return false;
      } 

      let token = 'Bearer ' + jsonwebtoken.sign({
        id : userData.id
      }, config.secret, {
        expiresIn: 1000
      });

      res.status(200).send({
        auth: true,
        msg: 'Success',
        id: userData.id,
        token: token
      });
      
      return false;
    }


    res.status(401).send({
      auth: false,
      msg: 'ERR',
      error: 'Invalid Username / Password'   
    });
});


module.exports = router;
