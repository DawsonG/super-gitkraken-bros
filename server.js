//
// # SimpleServer
//
var http = require('http');
var path = require('path');

var express = require('express');
var session = require('express-session');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();

app.use(session({
  secret: 'aAjiobn-9190JOinHui',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.resolve(__dirname, 'game')));

var server = http.createServer(app);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log(`Server started! Visit http://localhost:3000/.`);
});
