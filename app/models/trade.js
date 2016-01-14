// trade mongoose model
var mongoose = require('mongoose');
var Book = mongoose.model('Book').schema;

module.exports = mongoose.model('Trade', {
  book : Book,
  requestedBy : String,
  accepted : Boolean  ,
  requestedTo : String
});
