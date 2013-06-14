var request = require('request')
  , cheerio = require('cheerio');

exports.oreilly = function(callback) {
  get('http://www.oreilly.co.jp/catalog/soon.xml', oreilly, function(err, array) {
    callback(err, array);
  });
};

exports.computerbookjp = function(callback) {
  get('http://www.computerbook.jp/rss/books/index.xml', computerbookjp, function(err, array) {
    callback(err, array);
  });
};

function get(uri, func, callback) {
  var option = { uri: uri };
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
    var result = func(cheerio.load(body, { xmlMode: true, lowerCaseTagNames: false }));
    callback(null, result);
  });
}

function oreilly($) {
  return $('item').map(function() {
    var title = this.children('title').text();
    var publisher = 'オライリージャパン';
    var href = this.attr('rdf:about');
    var isbn = href.split('/')[4];
    return { title: title, publisher: publisher, href: href, isbn: isbn };
  });
}

function computerbookjp($) {
  return $('item').map(function() {
    var title = this.children('title').text();
    var href = this.children('guid').text();
    var publisher = '';
    var isbn = '';

    this.children('description').text().replace(/\r/g, '').split('\n').forEach(function(element) {
      if (element.match(/^出版社/)) {
        publisher = element.substring('出版社：'.length);
      } else if (element.match(/^ISBN/)) {
        isbn = element.substring('ISBN：'.length).replace(/-/g, '');
      }
    });
    return { title: title, publisher: publisher, isbn: isbn, href: href };
  });
}

function print(title, publisher, isbn) {
  console.log('＊書名　　　　：',title);
  console.log('（著者）　　　：');
  console.log('＊出版社　　　：',publisher);
  console.log('＊ＩＳＢＮ　　：',isbn);
  console.log('（本体価格）　：');
  console.log();
}