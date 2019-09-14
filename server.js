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

var home = require('./routes/home');
var call = require('./routes/call');
var dashboard = require('./routes/dashboard');
// var tickets = require('./routes/tickets');
var token = require('./routes/token');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
var port = process.env.PORT || 3000;
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: 'secret',
    name: 'browser-calls',
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
// middleware for flash message handling
app.use(function(req, res, next) {
  res.locals.success = req.flash('success');
  res.locals.errors = req.flash('errors');
  next();
});
app.use('/', home);
app.use('/call', call);
app.use('/dashboard', dashboard);
// app.use('/tickets', tickets);
app.use('/token', token);

// error handler
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port);
module.exports = app;
