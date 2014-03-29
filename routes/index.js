var async = require('async')
  , util = require('util')
  , amazon = require('./../lib/amazon')
  , scraper = require('./../lib/rssScraper')
  , Book = require('./../lib/model').Book
  , User = require('./../lib/model').User;

var cache = {
  lastModified: new Date().getTime(),
  isExpired: function() {
    return this.lastModified + 60 * 60 * 24 * 1000 < new Date().getTime();
  },
  update: function() {
    this.lastModified = new Date().getTime();
  }
};

var checkRegistered = function(array, isMember, callback) {
  if (!isMember) {
    Array.prototype.forEach.call(array, function(book) {
      book.registered = false;
    });
    callback(null, array);
    return;
  }
  async.each(array, function(book, callback) {
    Book.findOne({ isbn: book.isbn }, function(err, result) {
      if (err) {
        callback(err);
        return;
      }
      book.registered = result !== null;
      callback();
    });
  }, function(err) {
    callback(err, array);
  });
};

var searchAtAmazon = function(isMember, pageIndex, keywords, callback) {
  if (typeof keywords === 'function') {
    callback = keywords;
    keywords = null;
  }
  pageIndex = parseInt(pageIndex, 10) || 0;
  pageIndex = pageIndex > 0 ? pageIndex : 1;
  if (keywords === null && typeof cache.amazon !== 'undefined' && cache.amazon[pageIndex] !== 'undefined' && !cache.isExpired()) {
    checkRegistered(cache.amazon[pageIndex], isMember, callback);
    return;
  }
  amazon.search(pageIndex, keywords, function(err, array) {
    if (err) {
      callback(err);
      return;
    }
    checkRegistered(array, isMember, function(err, array) {
      if (err) {
        callback(err);
        return;
      }
      if (keywords === null) {
        if (cache.amazon === 'undefined' || cache.amazon !== 'object') {
          cache.amazon = {};
        }
        cache.amazon[pageIndex] = array;
        cache.update();
      }
      callback(null, array);
    });
  });
};

exports.amazon = function(req, res) {
  var passport = req.session.passport;
  var isMember = req.isAuthenticated() && typeof passport !== 'undefined' &&
    typeof passport.user !== 'undefined' && passport.user.member;
  var pageIndex = req.query.index;
  var keywords  = req.query.keywords;
  searchAtAmazon(isMember, pageIndex, keywords, function(err, array) {
    if (err) {
      res.send(404, err);
      return;
    }
    res.json(200, array);
  });
};

exports.index = function(req, res){
  var passport = req.session.passport;
  var isMember = req.isAuthenticated() && typeof passport !== 'undefined' &&
    typeof passport.user !== 'undefined' && passport.user.member;
  async.parallel({
    amazon: function(callback) {
      searchAtAmazon(isMember, 1, callback);
    },
    oreilly: function(callback) {
      if (typeof cache.oreilly !== 'undefined' && !cache.isExpired()) {
        checkRegistered(cache.oreilly, isMember, callback);
        return;
      }
      scraper.oreilly(function(err, array) {
        if (err) {
          callback(err);
          return;
        }
        checkRegistered(array, isMember, function(err, array) {
          cache.oreilly = array;
          cache.update();
          callback(err, array);
        });
      });
    },
    computerbookjp: function(callback) {
      if (typeof cache.computerbookjp !== 'undefined' && !cache.isExpired()) {
        checkRegistered(cache.computerbookjp, isMember, callback);
        return;
      }
      scraper.computerbookjp(function(err, array) {
        if (err) {
          callback(err);
          return;
        }
        checkRegistered(array, isMember, function(err, array) {
          cache.computerbookjp = array;
          cache.update();
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
      profile:        passport.user,
      amazon:         results.amazon,
      oreilly:        results.oreilly,
      computerbookjp: results.computerbookjp
    });
  });
};

exports.checkout = function(req, res) {
  var passport = req.session.passport;
  var isbnList = req.body.isbnList;
  if (!req.isAuthenticated() || typeof passport === 'undefined' ||
    typeof passport.user === 'undefined' || !passport.user.member) {
    res.send(401);
    return;
  }
  if (!util.isArray(isbnList) || isbnList.length === 0) {
    res.send(400);
    return;
  }

  async.each(req.body.isbnList,
    function(isbn, callback) {
      if (isbn.length !== 13) {
        callback(400);
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
        Book({ isbn: isbn }).save(callback);
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

exports.checkin = function(req, res) {
  var passport = req.session.passport;
  var isbn = req.params.isbn;
  if (!req.isAuthenticated() || typeof passport === 'undefined' ||
    typeof passport.user === 'undefined' || !passport.user.member) {
    res.send(401);
    return;
  }
  if (typeof isbn !== 'string' || isbn.length !== 13) {
    res.send(400);
    return;
  }

  Book.remove({ isbn: isbn }, function(err) {
    if (err) {
      res.send(500, err);
      return;
    }
    res.send(200, 'Success to checkin');
  });
};

exports.user = function(req, res) {
  var passport = req.session.passport;
  var wishListId = req.body.wishListId;
  if (!req.isAuthenticated() || typeof passport === 'undefined' ||
    typeof passport.user === 'undefined' || !passport.user.member) {
    res.send(401);
    return;
  }
  // The length of Amazon wish list Id is 13.
  if (typeof wishListId !== 'string' || wishListId.length !== 13) {
    res.send(400);
    return;
  }

  User.findOneAndUpdate({ userId: passport.user.id }, { $set: { wishListId: wishListId } }, function(err) {
    if (err) {
      res.send(500, err);
      return;
    }
    res.send(200);
  });
};

exports.wishList = function(req, res) {
  var passport = req.session.passport;
  var isMember = req.isAuthenticated() && typeof passport !== 'undefined' &&
    typeof passport.user !== 'undefined' && passport.user.member;
  if (!isMember) {
    res.send(401);
    return;
  }
  User.findOne({ userId: passport.user.id }, function(err, result) {
    if (err) {
      res.send(500, err);
      return;
    }
    if (!result) {
      res.send(403);
      return;
    }
    amazon.wishList(result.wishListId, function(err, array) {
      if (err) {
        res.send(500, err);
        return;
      }
      res.json(array);
    });
  });
};
