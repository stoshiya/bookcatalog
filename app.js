var express = require('express')
  , routes = require('./routes')
  , path = require('path')
  , favicon = require('static-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , passport = require('passport')
  , GithubStrategy = require('passport-github').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var githubClientId = process.env.GITHUB_CLIENT_ID;
var githubSecret   = process.env.GITHUB_CLIENT_SECRET;

if (!githubClientId || !githubSecret) {
  console.error('require client id and secret for connecting to GitHub API.');
  process.exit(1);
}

passport.use(new GithubStrategy({
    clientID:     githubClientId,
    clientSecret: githubSecret
  },
  function(token, tokenSecret, profile, done) {
    passport.session.accessToken = token;
    passport.session.profile = profile;
    done(null, {
      id:       profile.id,
      username: profile.username,
      photo:    profile._json.avatar_url
    });
  }
));

var app = express();
var port = process.env.PORT || 3000;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: 'secret' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error:   err
  });
});

app.get('/',                 routes.index);
app.get('/catalog/amazon',   routes.amazon);
app.post('/checkout',        routes.checkout);
app.delete('/checkin/:isbn', routes.checkin);
app.post('/user',            routes.user);
app.get('/wishList',         routes.wishList);

app.get('/login',    passport.authenticate('github'));
app.get('/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/login'
}));
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = app;

app.listen(port, function(){
  console.log("Express server listening on port " + port);
});

process.on('uncaughtException', function(err) {
  console.error(err);
});
