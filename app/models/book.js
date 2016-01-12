// thing mongoose model - needs to be populated or removed
var mongoose = require('mongoose');

module.exports = mongoose.model('Book', {
  google_id : String
});
