var OperationHelper = require('apac').OperationHelper
  , util = require('util');

var option = {
  awsId: process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET,
  assocId: process.env.AWS_ASSOCIATE_ID,
  endPoint: 'ecs.amazonaws.jp'
};

exports.get = get;

function get(itemPage, callback) {
  if (typeof itemPage !== 'number' || itemPage <= 0) {
    itemPage = 1;
  }
  new OperationHelper(option).execute('ItemSearch', {
    SearchIndex: 'Books',
    BrowseNode: '466298',
    ResponseGroup: 'ItemAttributes',
    Sort: 'daterank',
    ItemPage: itemPage
  }, function(err, results) {
    if (err) {
      callback(err);
      console.log(err);
      return;
    }
    if (typeof results.ItemSearchResponse == 'undefined') {
      callback(results);
      console.log(util.inspect(results, { showHidden: true, depth: null }));
      return;
    }
    callback(null, results.ItemSearchResponse.Items[0].Item.map(function(item) {
      return {
        title: item.ItemAttributes[0].Title[0],
        publisher: item.ItemAttributes[0].Publisher[0],
        isbn: item.ItemAttributes[0].EAN[0],
        href: item.DetailPageURL[0]
      };
    }));
  });
}
