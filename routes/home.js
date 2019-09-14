let express = require('express');
let router = express.Router();
const request = require('request');
const fs = require('fs');
let cmd = require('node-cmd');

/* GET home page route */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'call'
  });
});
/* GET bot page route */
router.get('/bot', function(req, res, next) {
  res.render('callIndex', {
    title: 'bot call'
  });
});

/*
 *POST Status call back route.
 */
const VoiceResponse = require('twilio').twiml.VoiceResponse;
router.post('/statuschange', function(req, res, next) {
  console.log('status');
  console.log(req.body);

  const response = new VoiceResponse();
  response.record({
    recordingStatusCallback: config.callback_domain + '/recordingCallBack',
    recordingStatusCallbackMethod: 'POST',
    timeout: 0
  });
  res.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  return res.end(response.toString());
});

let objOfRecordingSid = {};
let objOfCallSid = {};
let objOfCallSidAndText = {};
/*
 * POST Recording call back response will send here.
 */
router.post('/recordingCallBack', function(req, res, next) {
  console.log('============');
  console.log(req.body);
  try {
    //Post request to api
    if (req.body.RecordingUrl && req.body.RecordingDuration > 8) {
      request.post(
        {
          url: 'https://api.ytranslator.com/transcribe/v1',
          json: true,
          headers: {
            authorization: 'Bearer ' + config.apiKey, //API key
            'Content-Type': 'application/json'
          },
          body: {
            fileUrl: req.body.RecordingUrl + '.mp3',
            callbackUrl:
              config.callback_domain + '/transcribeCallBack/' + req.body.CallSid
          }
        },
        function(err, res, body) {
          if (err) {
            console.log('err');
            console.log(err);
          }
          console.log(body);
        }
      );
      //Creating array of object.
      objOfRecordingSid[req.body.RecordingSid] = req.body.CallSid;
      objOfCallSid[req.body.CallSid] = req.body.RecordingUrl;
    }
    res.send('ok');
  } catch (e) {
    console.log(e);
    res.send('ok');
  }
});

/*
 * POST Transcribe call back response will send here.
 */
router.post('/transcribeCallBack/:callSid?', function(req, res, next) {
  res.send('ok');
  if (req.body.job.transcriptUrl) {
    // API will return json file url pass that url in request and download body
    request.get(req.body.job.transcriptUrl, function(err, res, body) {
      if (err) console.log(err);
      let text = JSON.parse(body);
      let lengthOfSegment = text.segments.length;
      let lengthOfSequence = 0,
        lengthOftoken = 0;
      let str = '';
      //converting array of json object to useful text response
      for (j = 0; j < lengthOfSegment; j++) {
        lengthOfSequence = text.segments[j].sequences.length;
        for (i = 0; i < lengthOfSequence; i++) {
          lengthOftoken = text.segments[j].sequences[i].tokens.length;
          for (k = 0; k < lengthOftoken; k++) {
            str += text.segments[j].sequences[i].tokens[k].value + ' ';
          }
        }
      }
      fs.writeFile('./public/' + req.params.callSid + '.txt', str, function(
        err
      ) {
        if (err) throw err;
        let file_name = req.params.callSid + '.txt';
        //Using opennpl to covert text into sentence
        cmd.get(
          'cd apache-opennlp-1.9.1/bin/ & opennlp.bat SentenceDetector en-sent.bin < ' +
            __dirname +
            '/../public/' +
            file_name,
          function(err, data, stderr) {
            if (!err) {
              console.log('formated');
              console.log(data);
              objOfCallSidAndText[req.params.callSid] = data;
            } else {
              console.log('error', err);
            }
          }
        );
      });
      console.log(str);
    });
  } else {
    request.post(
      {
        url: 'https://api.ytranslator.com/transcribe/v1',
        json: true,
        headers: {
          authorization: 'Bearer ' + config.apiKey, //API key
          'Content-Type': 'application/json'
        },
        body: {
          fileUrl: req.body.job.fileUrl,
          callbackUrl: req.body.job.callbackUrl
        }
      },
      function(err, res, body) {
        if (err) {
          console.log('err');
          console.log(err);
        }
        console.log(body);
      }
    );
  }
});

/*
 * POST Check data route will check in data is received in callback and send response according to ajax request.
 */
router.post('/checkData', function(req, res, next) {
  let text = '',
    recordingurl = '';
  //Checking if recording url and text both exits in object or not
  if (objOfCallSid[req.body.callSid] && objOfCallSidAndText[req.body.callSid]) {
    text = objOfCallSidAndText[req.body.callSid];
    recordingurl = objOfCallSid[req.body.callSid];
  } else if (objOfCallSid[req.body.callSid]) {
    recordingurl = objOfCallSid[req.body.callSid];
  }
  res.send({
    type: 'success',
    text: text,
    recordingUrl: recordingurl
  });
});
/**
 * Send sms POST route
 */
router.post('/sendSms', function(req, res, next) {
  const accountSid = config.twilioConfig.accountSid;
  const authToken = config.twilioConfig.authToken;
  const client = require('twilio')(accountSid, authToken);
  // This twilio function will send OTP to register number
  client.messages
    .create({
      body: req.body.transcription,
      from: config.twilioConfig.number,
      to: req.body.number
    })
    .then(message => {
      console.log(message);
      // Send success response response
      res.send({
        type: 'success'
      });
    })
    .catch(err => {
      console.log(err);
      res.send({
        type: 'error'
      });
    });
});

module.exports = router;
