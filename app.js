var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , GithubStrategy = require('passport-github').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var twitterKey     = process.env.TWITTER_CONSUMER_KEY;
var twitterSecret  = process.env.TWITTER_CONSUMER_SECRET;
var githubClientId = process.env.GITHUB_CLIENT_ID;
var githubSecret   = process.env.GITHUB_CLIENT_SECRET;

if (!twitterKey || !twitterSecret) {
  console.error('require key and secret for twitter.');
  process.exit(1);
}

if (!githubClientId || !githubSecret) {
  console.error('require id and secret for github.');
  process.exit(1);
}

passport.use(new TwitterStrategy({
    consumerKey:    twitterKey,
    consumerSecret: twitterSecret
  },
  function(token, tokenSecret, profile, done) {
    passport.session.accessToken = token;
    passport.session.profile = profile;
    process.nextTick(function() {
      done(null, {
        id:       profile.id,
        username: profile.username,
        photo:    profile.photos[0].value
      });
    });
  }
));

passport.use(new GithubStrategy({
    clientID:     githubClientId,
    clientSecret: githubSecret
  },
  function(token, tokenSecret, profile, done) {
    passport.session.accessToken = token;
    passport.session.profile = profile;
    console.log(profile);
    process.nextTick(function() {
      done(null, {
        id:       profile.id,
        username: profile.username,
        photo:    profile._json.avatar_url
      });
    });
  }
));

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'secret' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/:index?', ensureGithubAuthenticated, routes.index);
//app.get('/login', routes.login);

app.get('/auth/twitter',   passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/login' // TODO
}));

app.get('/auth/github',          passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/login' // TODO
}));

function ensureTwitterAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/auth/twitter');
    return;
  }
  next();
}

function ensureGithubAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/auth/github');
    return;
  }
  next();
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
