var mongoose = require('mongoose');  

const GeoSchema = new Schema({
  type: {
      type: String,
      default: 'Point'
  },
  coordinates: {
      type: [Number],
      index: '2dsphere'
  }
});


var UserSchema = new mongoose.Schema({  
  name: String,
  email: String,
  password: String,  
  role: String,
  username: String,
  fullname: String,
  gender: String,
  date_of_birth:Date,
  message:String,
  telephone:String,
  profession: String,
  image: String,
  creation_dt:Date,
  rank: {
    type: String
  },
  available: {
      type: Boolean,
      default: false
  },
  geometry: GeoSchema
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User'); 