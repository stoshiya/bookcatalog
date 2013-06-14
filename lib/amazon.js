var OperationHelper = require('apac').OperationHelper
  , util = require('util')
  , request = require('./utils').request;

var option = {
  awsId:     process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET,
  assocId:   process.env.AWS_ASSOCIATE_ID,
  endPoint:  'ecs.amazonaws.jp'
};

exports.search = function(itemPage, callback) {
  if (typeof itemPage !== 'number' || itemPage <= 0) {
    itemPage = 1;
  }
  new OperationHelper(option).execute('ItemSearch', {
    SearchIndex:   'Books',
    BrowseNode:    '466298',
    ResponseGroup: 'ItemAttributes',
    Sort:          'daterank',
    ItemPage:      itemPage
  }, function(err, results) {
    if (err) {
      callback(err);
      return;
    }
    if (typeof results.ItemSearchResponse == 'undefined') {
      callback(results);
      return;
    }
    callback(null, results.ItemSearchResponse.Items[0].Item.map(function(item) {
      return {
        title:     item.ItemAttributes[0].Title[0],
        publisher: item.ItemAttributes[0].Publisher[0],
        isbn:      item.ItemAttributes[0].EAN[0],
        href:      item.DetailPageURL[0]
      };
    }));
  });
};

var wishListUri = function(id) {
  return 'http://www.amazon.co.jp/registry/wishlist/' + id + '/ref=cm_wl_sb_o?filter=all&layout=compact';
};

exports.wishList = function (callback) {
  request(wishListUri('1M7KJGCU1R8RT'), list, false, function(err, array) {
    callback(err, array);
  });
};

function list($) {
  return $('.itemWrapper').map(function() {
    request(this.find('.productTitle').children().children().attr('href'), content, true, function(err, result) {
      if (err) {
        console.error(err);
        return;
      }
      console.log(result);
      return result;
    });
  });
}

function content($) {
  var title = $('#btAsinTitle').text();
  var result = $('.content').find('li').filter(function() {
    return this.text().match(/ISBN-13/) !== null || this.text().match(/出版社: /) !== null;
  }).text();
  var publisher = result.replace(/出版社:\s/, '').replace(/\(.*/, '').trim();
  var isbn = result.replace(/.*\)ISBN-13:\s/, '').replace(/-/g, '');

  return { title: title, publisher: publisher, isbn: isbn };
}
