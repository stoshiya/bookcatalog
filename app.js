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
  console.error('require id and secret for github.');
  process.exit(1);
}

if (!githubOrg) {
  console.error('require organazation for github');
  process.exit(1);
}

passport.use(new GithubStrategy({
    clientID:     githubClientId,
    clientSecret: githubSecret
  },
  function(token, tokenSecret, profile, done) {
    passport.session.accessToken = token;
    passport.session.profile = profile;
    var options = {
      url: url.format({
        protocol: 'https',
        hostname: 'api.github.com',
        pathname: '/orgs/' + githubOrg + '/members/' + profile.username
      }),
      headers: {
        'Authorization': 'token ' + token
      }
    };
    request.get(options, function(err, res, body) {
      if (err) {
        done(err);
        return;
      }
      if (!res.statusCode == 204) {
        done(new Error(profile.username + ' is not an organization member'));
        return;
      }
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

app.get('/', routes.index);

app.get('/login',    passport.authenticate('github'));
app.get('/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

function ensureAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
    return;
  }
  next();
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
