var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require('./VerifyToken');

const emailhandler = require("./emailconfig");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file


router.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }).select('email password active').exec(function(err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    
    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid){
     return res.status(401).send({ auth: false, token: null });
    } else if(!user.active){
     return res.status(401).json({success:false,message:'Account is not yet activated. please check your e-mails to activated your account'});
    }else{
    // if user is found and password is valid
    // create a token
    //var token = jwt.sign({ id: user._id,email:user.email,username: user.username}, config.secret, { expiresIn: 86400 });
  // //    expires in 24 hours
  //   // return the information including token as JSON
  // res.status(200).send({ token: token,email:user.email,username: user.username });
 
        let token = jwt.sign({email:user.email,username:user.username},'secret', {expiresIn : '3h'});
        res.status(200).send({token: token });
 
  }
  });

});

router.get('/profile',  function(req,res,next){
  var decodedToken='';
console.log("in user")
  let token = req.query.token;

  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      console.log(err)
   res.status(400).json({message:' Unauthorized request'});
    }
    if(tokendata){
      decodedToken = tokendata;

      console.log("id - "+JSON.stringify(decodedToken))
      User.findOne({email:decodedToken.email}).then(doc=>{

        console.log(doc)

        // doc.toObject()
        // doc.password = ""

        res.json(doc)

      }).catch(err=>{
console.log(err)
      })

      console.log(decodedToken)
  //res.status(200).json(decodedToken.username);

    }
  })

})


router.post('/resetpassword', function(req, res) {
  User.findOne({ email: req.body.email }).select('email active').exec(function(err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    
    // check if the password is valid
    // var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    // if (!passwordIsValid){
    //  return res.status(401).send({ success: false, message: 'password is invalid' });
    // } else 
    if(!user.active){
     return res.status(401).json({success:false,message:'Account is not yet activated. please check your e-mails to activated your account'});
    }else{
    // if user is found and password is valid
   
  console.log("password reset")
  var hashedPassword = bcrypt.hashSync(req.body.newpassword, 8);
     var newValues={
       $set:{password:hashedPassword}
     }

     User.updateOne(user,newValues,function(err,res){
      if (err)
       {
        console.log(" error in updating password") 
        throw err;
      }
      
       console.log("Successfully updated the new password")
         emailhandler.mailhandlerpasswordreset(user.email,user.username,'1212')
      
      ;
    })
  }
  });
 
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});


router.post('/register', function(req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.create({
    //name : req.body.name,
    email : req.body.email,
    username: req.body.username,
    password : hashedPassword,
    role: 'User',
   
  }, 
  function (err, user) {
    if (err) return res.status(500).send("There was a problem registering the user`.");

    // if user is registered without errors
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
      

    });
    console.log("just created")
    emailhandler.mailhandleremailconfirm(user.email,user.username,'1212')
   // res.status(200).send({ auth: true, token: token, role:'User' });
   res.status(200).send({ auth: true, role:'User' });
  });

});


router.get('/me', VerifyToken, function(req, res, next) {

  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

// Route to activate the user's account	
router.put('/active', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) throw err; // Throw error if cannot login
     console.log("active account")
     var newValues={
       $set:{active:true}
     }

     User.updateOne(user,newValues,function(err,res){
      if (err)

       {
        console.log("error in activation") 
        throw err;
      }
       console.log("Activation successfull"); 
    })
     
  
  });
});

router.post('/registerdetails',function(req, res){
  console.log("apu data 0 - - - "+JSON.stringify(req.body))

  var newdata = {
          fullname: req.body.fullname,
          gender: req.body.gender,
          date_of_birth:req.body.date_of_birth,
          message: req.body.message,
          telephone:req.body.telephone,
          profession:req.body.profession,
          image:req.body.image,
          creation_dt: Date.now()
  }

  User.updateOne({email:req.body.email},newdata,{upsert: true}).then(doc=>{
    console.log("succss - "+JSON.stringify(doc))
    return res.status(201).json(doc);
  })     
})

module.exports = router;