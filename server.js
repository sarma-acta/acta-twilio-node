var express = require('express');
var port = process.env.PORT || 3000;
var app = express();

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
