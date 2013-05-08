var async = require('async')
  , scraper = require('./../lib/scrape');

exports.index = function(req, res){
  async.parallel({
    oreilly: function(callback) {
      scraper.oreilly(function(array) {
        callback(null, array);
      });
    },
    computerbookjp: function(callback) {
      scraper.computerbookjp(function(array) {
        callback(null, array);
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
      oreilly: results.oreilly,
      computerbookjp: results.computerbookjp
    })
  });
};
