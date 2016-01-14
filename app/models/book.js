// book mongoose model
var mongoose = require('mongoose');

module.exports = mongoose.model('Book', {
  googleId : String,
  image : String,
  authors : String,
  title : String,
  subtitle : String,
  publishedDate : String,
  publisher : String,
  owner : String
});
