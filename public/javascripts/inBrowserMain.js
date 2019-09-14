/* Get a Twilio Client token with an AJAX request */
$(document).ready(function() {
  $('.answerButton').click(function() {
    console.log('ANSWER BUTTON');
    call();
  });
  $('.hangUpButton').click(function() {
    hangUp();
  });
  $('.sendSms').click(function() {
    sendMessage();
  });
  $.post('/token/generate', { page: window.location.pathname }, function(data) {
    // Set up the Twilio Client Device with the token
    Twilio.Device.setup(data.token);
  });
});
let callSid;
/* Callback to let us know Twilio Client is ready */
Twilio.Device.ready(function(device) {
  $('.message').text('Ready to go!');
});

/* Report any errors to the call status display */
Twilio.Device.error(function(error) {
  $('.message').text('ERROR: ' + error.message);
});

/* Callback for when Twilio Client initiates a new connection */
Twilio.Device.connect(function(connection) {
  console.log(connection.parameters.CallSid);
  callSid = connection.parameters.CallSid;

  // If phoneNumber is part of the connection, this is a call from a
  // support agent to a customer's phone
  if ('phoneNumber' in connection.message) {
    $('.message').text('In call with ' + connection.message.phoneNumber);
  }
});

/* Callback for when a call ends */
Twilio.Device.disconnect(function(connection) {
  // Disable the hangup button and enable the call buttons
  $('.hangUpButton').prop('disabled', true);
  $('#loader').show();
  $('.message').text('Wait while we load your data');
  addData();
});

/* Call a customer from a support ticket */
function call() {
  $('.message').text('Call Initiated..!!');
  // Enable the hang up button and disable the call buttons
  $('.hangUpButton').show();
  $('.answerButton').hide();

  var params = { number: $('#phoneNumber').val() };
  Twilio.Device.connect(params);
}

/* End a call */
function hangUp() {
  Twilio.Device.disconnectAll();
}

/* Send transcript in message*/
function sendMessage() {
  $.ajax({
    url: '/sendSms',
    type: 'post',
    data: {
      number: $('#phoneNumber').val(),
      transcription: $('#transcription').val()
    },
    success: result => {
      if (result.type == 'success') {
        $('.sendSms').prop('disabled', true);
        $('#sms').text('SMS send successfully');
      } else {
        alert('error');
      }
    }
  });
}

//Check data if recording url and text in present in object
function addData() {
  $.ajax({
    url: '/checkData',
    type: 'post',
    data: { callSid: callSid },
    success: result => {
      if (result.type == 'success') {
        //If recording url and text both receive or not
        if (result.recordingUrl && result.text) {
          //Check if recording url is already inserted or not
          if ($('#recordUrl').attr('src')) {
            $('#transcription').text(result.text);
            $('#labelTranscription').show();
            $('#transcription').removeClass('hidden');
          } else {
            $('#recordUrl').attr('src', result.recordingUrl);
            audio.load();
            $('#audio').show();
            $('#transcription').text(result.text);
            $('#labelTranscription').show();
            $('#transcription').removeClass('hidden');
          }
          // $(".hangupButton").hide()
          $('#loader').hide();
          $('.newCallButton').show();
          let length = $('#transcription').val().length;
          let i;
          i = Math.ceil(length / 160);
          strData = length + ' Character, Segment-' + i;
          $('#count').text('Length of transcription : ' + strData);
          $('#count').show();
          $('.sendSms').show();
          $('.message').text('Ready to go!');
        } else if (result.recordingUrl) {
          //Check if recording url is already inserted or not
          if ($('#recordUrl').attr('src')) {
          } else {
            $('#recordUrl').attr('src', result.recordingUrl);
            audio.load();
            $('#audio').show();
          }
          //Call function after 3 second
          setTimeout(function() {
            addData();
          }, 5000);
        } else {
          //Call function after 3 second
          setTimeout(function() {
            addData();
          }, 5000);
        }
      } else {
        alert('error');
      }
    }
  });
}
