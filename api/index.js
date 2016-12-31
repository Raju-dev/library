var express = require('express');
var router = express.Router();
var models = require('../models');
var credential = require('credential');
var pw = credential();
var Promise = require("bluebird");
var _ = require("lodash");

router.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


var securityCheck = function(req, res, next){
  if(req.session.user){
    return next();
  }
  else{
    return res.status(403).send({message: 'Unautharized'});
  }
};

router.get('/transactions', securityCheck, function(req, res, next){
  models.transaction.find({})
  .then(function(transactions){
    var booksid = [];
    var usersid = [];
    transactions.forEach(function(transaction){
      booksid.push(transaction.book_id);
      usersid.push(transaction.user_id);
    });

    var usersPromise = new Promise((resolve, reject) => {
      models.user.find({ _id : { $in : usersid}})
      .then(function(users){
        resolve(users);
      })
      .catch(function(error){
        reject(error);
      })
    });

    var booksPromise = new Promise((resolve, reject) => {
      models.book.find({ _id : { $in : booksid}})
      .then(function(books){
        resolve(books);
      })
      .catch(function(error){
        reject(error);
      })
    });

    var promisesArray = [usersPromise, booksPromise];

    Promise.all(promisesArray)
    .then(function(values){
      var users = values[0];
      var books = values[1];
      var withusers = [];

      transactions.forEach(function(transaction){
        var user = _.find(users, function(v){
          return String(transaction.user_id) == String(v._id);
        });
        var book = _.find(books, function(v){
          return String(transaction.book_id) == String(v._id);
        });
        var data = {
          transaction : transaction,
          book : book,
          user : user
        }
        withusers.push(data);
      });
      return res.json(withusers);
    });
  })
  .catch(function(error){
    return next(error);
  })
});


router.post('/auth', function(req, res){
     var email = req.body.email;
     var password = req.body.password;
     models.user.findOne({
         email: email
     })
     .then(function(usr){
        if(!usr) return res.status(401).json({message: 'Invalid username or password.'});

        pw.verify(usr.password, password, function (err, isValid) {
          if (err) { return res.status(401).json({message: 'Invalid username or password.'}); }

          if(isValid){
            req.session.user = usr;
            res.json(usr);
          } else {
            return res.status(401).json({message: 'Invalid username or password.'});
          }
        });
     })
     .catch(function(e){
       res.status(500).send(e);
     })
});

router.post('/logout', securityCheck, function(req, res){
  req.session.destroy(function(err) {
    res.status(200).json({message: "Logout Successfully!"});
  });
});



router.post('/transaction', securityCheck, function(req, res, next){
  if(req.body.type=="return"){
    models.transaction.findOne({
      book_id : req.body.book_id,
      returned_date : null
    })
    .then(function(old_transaction){
      var transaction = new models.transaction({
        book_id : old_transaction.book_id,
        user_id : old_transaction.user_id,
        returned_date : req.body.returned_date,
        type : req.body.type
      });
      transaction.save()
      .then(function(result){
        models.transaction.update({
          _id : old_transaction._id
        }, {
          returned_date : req.body.returned_date
        })
        .then(function(){
          models.book.update({
            _id : req.body.book_id
          }, {
            availability: true
          })
          .then(function(){
            return res.json(result);
          })
          .catch(function(error){
            return next(error);
          });
        })
        .catch(function(error){
          return next(error);
        });
      });
    });
  } else {
      var transaction = new models.transaction(req.body);
      transaction.save()
      .then(function(result){
        models.book.update({
          _id : req.body.book_id
        }, {
          availability : false
        })
        .then(function(){
          return res.json(result);
        })
      })
      .catch(function(error){
        return next(error);
      })
  }
});


router.get('/users', securityCheck, function(req, res, next){
  models.user.find({})
  .then(function(result){
    res.json(result);
  })
  .catch(function(error){
    return next(error);
  })
});

router.delete('/user/:id', securityCheck, function(req, res, next){
  models.user.remove({
    _id : req.params.id
  })
  .then(function(result){
    models.transaction.remove({
      user_id : req.params.id
    })
    .then(function(){
      return res.json(result);
    });
  })
  .catch(function(error){
    return next(error);
  })
});


router.post('/users', securityCheck, function(req, res, next){
  if(req.body._id){
    var valu = req.body;
    models.user.update({
      _id : req.body._id,
    }, valu)
    .then(function(result){
      return res.json(result);
    })
    .catch(function(error){
      return next(error);
    })
  } else {
    models.user.findOne({
        email: req.body.email
    })
    .then(function(usr){
      if(usr){
        res.status(400).send({message: "User already . Try another email."});
      }
      credential().hash(req.body.password, function (err, hash) {
        if (err) { return next(err); }
        else {
          req.body.password = hash;
          var user = new models.user(req.body);
          user.save(req.body)
          .then(function(result){
            return res.json(result);
          })
          .catch(function(error){
            return next(error);
          })
        }
      });
    })
    .catch(function(error){
      return next(error);
    })

  }
});

router.put('/users', securityCheck, function(){
  models.user.update({ _id: req.body._id }, { $set: req.body})
  .then(function(result){
    return res.json(result);
  })
  .catch(function(error){
    return next(error);
  });
});


//Handle books router
router.get('/books', securityCheck, function(req, res, next){
  models.book.find({})
  .then(function(result){
    res.json(result);
  })
  .catch(function(error){
    return next(error);
  })
});

router.delete('/book/:id', securityCheck, function(req, res, next){
  models.book.remove({
    _id : req.params.id
  })
  .then(function(result){
    models.transaction.remove({
      book_id : req.params.id
    })
    .then(function(){
      return res.json(result);
    });
  })
  .catch(function(error){
    return next(error);
  })
})

router.post('/books', securityCheck, function(req, res, next){
  if(!req.body._id){
    var user = new models.book(req.body);
    user.save(req.body)
    .then(function(result){
      return res.json(result);
    })
    .catch(function(error){
      return next(error);
    })
  } else {
    var valu = req.body;
    models.book.update({
      _id : req.body._id,
    }, valu)
    .then(function(result){
      return res.json(result);
    })
    .catch(function(error){
      return next(error);
    })
  }
});


module.exports = router;
