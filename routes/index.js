exports.index = function(req, res){
  res.render('index', { title: 'Book Catalog', profile: req.session.passport.user });
};
