var express = require('express');
var router = express.Router();
let twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * Post route to receive  twilio webhook for call connection
 */
router.post('/connect', function(req, res, next) {
  console.log(req.body);
  try {
    var phoneNumber = req.body.number;
    var callerId = config.twilioConfig.number;
    var twiml = new VoiceResponse();
    //dial twiml with recording callback
    var dial = twiml.dial({
      callerId: callerId,
      record: 'record-from-answer',
      recordingStatusCallback: config.callback_domain + '/recordingCallBack',
      // timeout: 0,
      timeLimit: 900
    });
    //checking for number is null or not
    if (phoneNumber != null) {
      //dial to number receive in response of twilio webhook
      dial.number(phoneNumber);
    }
    res.send(twiml.toString());
  } catch (e) {
    console.log(e);
  }
});
/**
 * Post route to add bot to any meeting
 */
router.post('/connectCall', function(req, res, next) {
  console.log(req.body);
  try {
    const accountSid = config.twilioConfig.accountSid;
    const authToken = config.twilioConfig.authToken;
    var phoneNumber = req.body.number;
    var callerId = config.twilioConfig.number;
    const client = require('twilio')(accountSid, authToken);
    //Twilio call function
    client.calls
      .create({
        sendDigits: req.body.extension,
        url: config.callback_domain + '/statuschange',
        to: phoneNumber,
        from: callerId
      })
      .then(call => {
        console.log(call.sid);
        res.send({
          type: 'success',
          callSid: call.sid
        });
      });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
