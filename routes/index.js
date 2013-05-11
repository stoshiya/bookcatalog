var async = require('async')
  , amazon = require('./../lib/amazon')
  , scraper = require('./../lib/rssScrape');

exports.index = function(req, res){
  async.parallel({
    amazon: function(callback) {
      var pageIndex = parseInt(req.params.index, 10) || 1;
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      amazon.get(pageIndex, function(err, array) {
        callback(err, array);
      })
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
      amazon: results.amazon,
      oreilly: results.oreilly,
      computerbookjp: results.computerbookjp
    })
  });
};
