var async = require('async')
  , util = require('util')
  , amazon = require('./../lib/amazon')
  , scraper = require('./../lib/rssScrape')
  , Book = require('./../model/book');


var checkRegistered = function (array, isMember, callback) {
  if (!isMember) {
    array.forEach(function(book) {
      book.registered = false;
    });
    callback(null, array);
    return;
  }
  async.each(array, function (book, callback) {
    Book.findOne({ isbn: book.isbn }, function (err, result) {
      if (err) {
        callback(err);
        return;
      }
      book.registered = !!result;
      callback();
    });
  }, function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null, array);
  });
};

exports.index = function(req, res){
  var isMember = req.isAuthenticated() && typeof req.session.passport.user !== 'undefined' && req.session.passport.user.member;
  async.parallel({
    amazon: function(callback) {
      var pageIndex = parseInt(req.params.index, 10) || 1;
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      amazon.get(pageIndex, function(err, array) {
        if (err) {
          callback(err);
          return;
        }
        checkRegistered(array, isMember, function(err, array) {
          callback(err, array);
        });
      });
    },
    oreilly: function(callback) {
      scraper.oreilly(function(err, array) {
        if (err) {
          callback(err);
          return;
        }
        checkRegistered(array, isMember, function(err, array) {
          callback(err, array);
        });
      });
    },
    computerbookjp: function(callback) {
      scraper.computerbookjp(function(err, array) {
        if (err) {
          callback(err);
          return;
        }
        checkRegistered(array, isMember, function(err, array) {
          callback(err, array);
        });
      });
    }
  }, function(err, results) {
    if (err) {
      res.send(500, err);
      return;
    }
    res.render('index', {
      title:          'Book Catalog',
      profile:        req.session.passport.user,
      amazon:         results.amazon,
      oreilly:        results.oreilly,
      computerbookjp: results.computerbookjp
    });
  });
};

exports.checkout = function(req, res) {
  var passport = req.session.passport;
  if (!req.isAuthenticated() || typeof passport === 'undefined' || typeof passport.user === 'undefined' || !passport.user.member) {
    res.send(401);
    return;
  }
  if (typeof req.body === 'undefined' || !util.isArray(req.body.isbnList)) {
    res.send(400);
    return;
  }

  async.each(req.body.isbnList,
    function(isbn, callback) {
      if (isbn.length !== 13) {
        callback();
        return;
      }
      Book.findOne({ isbn: isbn }, function(err, result) {
        if (err) {
          callback(err);
          return;
        }
        if (result) {
          callback();
          return;
        }
        Book({ isbn: isbn }).save(function(err) {
          callback(err);
        });
      });
    },
    function(err) {
      if (err) {
        res.send(500, err);
        return;
      }
      res.send(201, 'Success to checkout');
    });
};
