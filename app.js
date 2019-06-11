var express = require('express');
var app = express();
var db = require('./db');
global.__root   = __dirname + '/'; 
var http=require('http').Server(app);
var io = require('socket.io')(http);
var ip = require('ip');
app.use(express.static('./')); 
// const server = require('http').createServer();

// const io = require('socket.io')(server, {
//   path: '/test',
//   serveClient: false,
//   // below are engine.IO options
//   pingInterval: 10000,
//   pingTimeout: 5000,
//   cookie: false
// });

// server.listen(3200);

// add cors 
var cors = require('cors');
app.use(cors({
  origin: '*',
  credentials:true
}));

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

// var ChatController = require(__root + 'chat/controller.js');
// app.use('/api/chat', ChatController);
require("./chat/controller.js")(app,io);

http.listen(3000,function(){
  console.log("Node Server is setup and it is listening on http://"+ip.address()+":3000");
})


module.exports = app;