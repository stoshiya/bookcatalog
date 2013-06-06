var async = require('async')
  , amazon = require('./../lib/amazon')
  , scraper = require('./../lib/rssScrape')
  , Book = require('./../model/book');

exports.index = function(req, res){
  async.parallel({
    amazon: function(callback) {
      var pageIndex = parseInt(req.params.index, 10) || 1;
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      amazon.get(pageIndex, function(err, array) {
        callback(err, array);
      });
    },
    oreilly: function(callback) {
      scraper.oreilly(function(err, array) {
        callback(err, array);
      });
    },
    computerbookjp: function(callback) {
      scraper.computerbookjp(function(err, array) {
        callback(err, array);
      });
    }
  }, function(err, results) {
    if (err) {
      res.send(500, err);
      return;
    }
    res.render('index', {
      title: 'Book Catalog',
      profile: req.session.passport.user,
      amazon:         results.amazon,
      oreilly:        results.oreilly,
      computerbookjp: results.computerbookjp
    });
  });
};

exports.checkout = function(req, res) {
  var passport = req.session.passport;
  if (typeof passport === 'undefined' || typeof passport.user === 'undefined' || !passport.user.member) {
    res.send(401);
    return;
  }
  if (typeof req.body === 'undefined') {
    res.send(400);
  }

  var isbnList = req.body.split(',');
  async.each(isbnList, function(isbn, callback) {
    Book.findOne({ isbn: isbn }, function(err, result) {
      if (err) {
        callback(err);
        return;
      }
      if (!result) {
        Book({ isbn: isbn }).save(function(err) {
          callback(err);
          return;
        });
      }
      callback();
    });
  }, function(err) {
    if (err) {
      res.send(500, err);
      return;
    }
    res.send(201, 'Success to checkout');
  });
};