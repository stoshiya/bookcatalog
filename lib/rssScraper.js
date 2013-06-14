var request = require('./utils').request;

exports.oreilly = function(callback) {
  request('http://www.oreilly.co.jp/catalog/soon.xml', oreilly, false, function(err, array) {
    callback(err, array);
  });
};

exports.computerbookjp = function(callback) {
  request('http://www.computerbook.jp/rss/books/index.xml', computerbookjp, false, function(err, array) {
    callback(err, array);
  });
};

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
