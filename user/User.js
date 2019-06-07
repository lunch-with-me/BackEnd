var mongoose = require('mongoose');  

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
  creation_dt:Date
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User'); 