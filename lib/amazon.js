var OperationHelper = require('apac').OperationHelper
  , util = require('util');

var option = {
  awsId: process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET,
  assocId: 'wwwsaitohnu-22',
  endPoint: 'ecs.amazonaws.jp'
};

get(1);

function get(itemPage) {
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
      console.log(err)
      return;
    }

    var items = results.ItemSearchResponse.Items[0].Item;
    for (var i = 0, len = items.length; i < len; i++) {
      var item = items[i].ItemAttributes[0];
      console.log(item.EAN[0], item.Title[0], item.Publisher[0]);
    }
    console.log(util.inspect(results, true, null));
  });
}
