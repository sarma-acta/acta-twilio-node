var createError = require('http-errors');
var express = require('express');
var session = require('express-session');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// global.db = require('./models');
global.config = require('./config/config');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/', function(req, res) {
  res.send({
    Output: 'Hello World again!'
  });
});

app.post('/', function(req, res) {
  res.send({
    Output: 'Hello World again!'
  });
});

app.listen(port);
module.exports = app;
