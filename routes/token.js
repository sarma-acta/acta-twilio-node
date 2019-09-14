var express = require('express');
var router = express.Router();
var ClientCapability = require('twilio').jwt.ClientCapability;

// GET /token/generate
router.post('/generate', function (req, res) {
  var page = req.body.page;
  var clientName = 'customer'

  var capability = new ClientCapability({
    accountSid: config.twilioConfig.accountSid,
    authToken: config.twilioConfig.authToken
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({
      applicationSid: config.twilioConfig.appSid
    }));
  capability.addScope(
    new ClientCapability.IncomingClientScope(clientName));

  var token = capability.toJwt();
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ token: token }));
});

module.exports = router;
