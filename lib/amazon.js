var async = require('async')
  , OperationHelper = require('apac').OperationHelper
  , url = require('url')
  , util = require('util')
  , request = require('./utils').request
  , cheerio = require('cheerio')
  , agent = require('http').globalAgent
  , Iconv = require('iconv').Iconv;

var iconv = new Iconv('SHIFT_JIS', 'UTF-8//TRANSLIT//IGNORE');

var option = {
  awsId:     process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET,
  assocId:   process.env.AWS_ASSOCIATE_ID,
  endPoint:  'ecs.amazonaws.jp'
};

exports.search = function(itemPage, keywords, callback) {
  if (typeof itemPage !== 'number' || itemPage <= 0) {
    itemPage = 1;
  }
  new OperationHelper(option).execute('ItemSearch', {
    SearchIndex:   'Books',
    BrowseNode:    '466298',
    ResponseGroup: 'ItemAttributes',
    Sort: 'daterank',
    Keywords: keywords,
    ItemPage: itemPage
  }, function(err, results) {
    if (err) {
      callback(err);
      return;
    }
    if (typeof results.ItemSearchResponse == 'undefined') {
      callback(results);
      return;
    }
    if (typeof results.ItemSearchResponse.Items[0].Request[0].Errors !== 'undefined') {
      console.error(results.ItemSearchResponse.Items[0].Request[0].Errors[0].Error[0].Message);
      callback(null, []);
      return;
    }
    callback(null, results.ItemSearchResponse.Items[0].Item
      .filter(function(item) {
        return typeof item.ItemAttributes[0].Title !== 'undefined' &&
          typeof item.ItemAttributes[0].Publisher !== 'undefined' &&
          typeof item.ItemAttributes[0].EAN !== 'undefined' &&
          typeof item.DetailPageURL !== 'undefined';
      })
      .map(function(item) {
        return {
          title:     item.ItemAttributes[0].Title[0],
          publisher: item.ItemAttributes[0].Publisher[0],
          isbn:      item.ItemAttributes[0].EAN[0],
          href:      item.DetailPageURL[0]
        };
      }));
  });
};

exports.wishList = function (wishListId, callback) {
  var option = {
    uri: url.format({
      protocol: 'http',
      host: 'www.amazon.co.jp',
      pathname: '/registry/wishlist/' + wishListId + '/ref=cm_wl_sb_o',
      query: { filter: 'all', layout: 'compact' }
    }),
    encoding: null,
    pool: agent.maxSockets = 100
  };
  if (typeof process.env.http_proxy !== 'undefined') {
    option.proxy = process.env.http_proxy;
  }
  require('request').get(option, function (err, response, body) {
    if (err) {
      callback(err);
      return;
    }
    if (response.statusCode !== 200) {
      callback(response.statusCode);
      return;
    }
    $ = cheerio.load(iconv.convert(new Buffer(body)).toString('utf8'), { xmlMode: true, lowerCaseTagNames: false });
    async.map(
      $('.itemWrapper').map(function () {
        return $(this).find('.productTitle').children().children().attr('href');
      }),
      function (uri, callback) {
        request(uri, content, true, function (err, result) {
          if (err) {
            callback(err);
            return;
          }
          result.href = uri;
          callback(null, result);
        });
      }, callback);
  });
};

function content($) {
  var title = $('#btAsinTitle').text();
  var result = $('.content').find('li').filter(function() {
    return this.text().match(/ISBN-13/) !== null || this.text().match(/出版社: /) !== null;
  }).text();
  var publisher = result.replace(/出版社:\s/, '').replace(/\(.*/, '').trim();
  var isbn = result.replace(/.*\)ISBN-13:\s/, '').replace(/-/g, '');

  return { title: title, publisher: publisher, isbn: isbn };
}
