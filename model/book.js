var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var mongolabUrl = process.env.MONGOLAB_URI;
var uri = typeof mongolabUrl === 'string' && mongolabUrl.length > 0 ? mongolabUrl : 'mongodb://localhost/bookcatalog';
var db = mongoose.createConnection(uri);

var bookSchema = new Schema({
	isbn: String,
	date: { type: Date, default: Date.now }
 });

var Book = db.model('book', bookSchema);

module.exports = Book;