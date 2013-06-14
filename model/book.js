var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var mongolabUri = process.env.MONGOLAB_URI;
var uri = typeof mongolabUri === 'string' && mongolabUri.length > 0 ? mongolabUri : 'mongodb://localhost/bookcatalog';
var db = mongoose.createConnection(uri);

var bookSchema = new Schema({
  isbn: String,
  date: { type: Date, default: Date.now }
});

var Book = db.model('book', bookSchema);

module.exports = Book;