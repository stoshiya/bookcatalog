var express = require('express')
  , routes = require('./routes')
  , url = require('url')
  , http = require('http')
  , path = require('path')
  , request = require('request')
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
var githubOrg      = process.env.GITHUB_ORG;

if (!githubClientId || !githubSecret) {
  console.error('require client id and secret for connecting to GitHub API.');
  process.exit(1);
}

function checkMember(profile, token, callback) {
  if (githubOrg) {
    request.get({
      url: url.format({
        protocol: 'https',
        hostname: 'api.github.com',
        pathname: '/orgs/' + githubOrg + '/members/' + profile.username
      }),
      headers: { 'Authorization': 'token ' + token }
    }, function (err, res) {
      if (err) {
        callback(false);
        return;
      }
      callback(res.statusCode === 204);
    });
  } else {
    callback(false);
  }
}

passport.use(new GithubStrategy({
    clientID:     githubClientId,
    clientSecret: githubSecret
  },
  function(token, tokenSecret, profile, done) {
    passport.session.accessToken = token;
    passport.session.profile = profile;
    checkMember(profile, token, function(isMember) {
      done(null, {
        id:       profile.id,
        username: profile.username,
        photo:    profile._json.avatar_url,
        member:   isMember
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

app.get('/', routes.index);
app.get('/catalog/amazon', routes.amazon);
app.post('/checkout', routes.checkout);
app.delete('/checkin/:isbn', routes.checkin);
app.post('/user', routes.user);
app.get('/wishList', routes.wishList);

app.get('/login',    passport.authenticate('github'));
app.get('/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/login'
}));
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err) {
  console.error(err);
});
