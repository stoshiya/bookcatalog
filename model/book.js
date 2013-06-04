var mongoose = require('mongoose');
var mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('require mongo db URI.');
  process.exit(1);
}

var db = mongoose.createConnection(mongoUri + '/bookcatalog');
var schema = new mongoose.Schema({ any: {} });
var Book = db.model('book', schema);
module.exports = Book;