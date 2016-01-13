// thing mongoose model - needs to be populated or removed
var mongoose = require('mongoose');

module.exports = mongoose.model('Book', {
  googleId : String,
  image : String,
  authors : String,
  title : String,
  subtitle : String,
  publishedDate : String,
  publisher : String,
  isCurrentlyTraded : Boolean,
  owner : String
});
