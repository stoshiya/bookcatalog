var request = require('request')
  , cheerio = require('cheerio');

get('http://www.oreilly.co.jp/catalog/soon.xml', oreilly);
get('http://www.computerbook.jp/rss/books/index.xml', computerbookjp);

function get(uri, func) {
  var option = { uri: uri };
  if (typeof process.env.http_proxy !== 'undefined') {
    option.proxy = process.env.http_proxy;
  }
  request.get(option, function(err, response, body) {
    if (err || response.statusCode !== 200) {
      console.log(response.statusCode, err);
      return;
    }
    func(cheerio.load(body));
  });
}

function oreilly($) {
  $('item').each(function() {
    var title = this.children('title').text();
    var publisher = 'オライリージャパン';
    var isbn = this.attr('rdf:about').split('/')[4];

    print(title, publisher, isbn);
  });
}

function computerbookjp($) {
  $('item').each(function() {
    var title = this.children('title').text();
    var publisher = '';
    var isbn = '';
    this.children('description').text().replace(/\r/g, '').split('\n').forEach(function(element) {
      if (element.match(/出版社/)) {
        publisher = element.substring('出版社：'.length);
      }
      if (element.match(/ISBN/)) {
        isbn = element.substring('ISBN：'.length).replace(/-/g, '');
      }
    });

    print(title, publisher, isbn);
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