var request = require('request')
  , cheerio = require('cheerio')
  , agent = require('http').globalAgent
  , Iconv = require('iconv').Iconv;

var iconv = new Iconv('SHIFT_JIS', 'UTF-8//TRANSLIT//IGNORE');

exports.request = function (uri, func, useIconv, callback) {
  var option = { uri: uri, encoding: null, pool: agent.maxSockets = 100 };
  if (typeof process.env.http_proxy !== 'undefined') {
    option.proxy = process.env.http_proxy;
  }
  request.get(option, function(err, response, body) {
    if (err) {
      callback(err);
      return;
    }
    if (response.statusCode !== 200) {
      callback(response.statusCode);
      return;
    }
    if (useIconv) {
      body = (iconv.convert(new Buffer(body))).toString('utf8');
    }
    var result = func(cheerio.load(body, { xmlMode: true, lowerCaseTagNames: false }));
    callback(null, result);
  });
};
