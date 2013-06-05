var mongoose = require('mongoose');
var mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('require mongo db URI.');
  process.exit(1);
}

var db = mongoose.createConnection(mongoUri + '/bookcatalog');
var schema = new mongoose.Schema({
	name: String,
	isbn: String,
	publisher: String,
	date: { type: Date, default: Date.now }
 });
var Book = db.model('book', schema);
module.exports = Book;