/* Get a Twilio Client token with an AJAX request */
$(document).ready(function() {
  $('.message').text('Ready to go!');
  $('.answerButton').click(function() {
    console.log('MAIN JS ANSWER BUTTON');
    call();
  });
});

let callSid;
function call() {
  console.log('result');
  /* Callback for when Twilio Client initiates a new connection */
  $.ajax({
    url: '/call/connectCall',
    type: 'post',
    data: { number: $('#phoneNumber').val(), extension: $('#extension').val() },
    success: result => {
      if (result.type == 'success') {
        callSid = result.callSid;
        $('.message').text('Wait till we load your data');
        $('.answerButton').prop('disabled', false);
        $('#loader').show();
        addData();
      } else {
        alert('error');
      }
    }
  });
  $('.message').text('call Initialized...');
  $('.answerButton').hide();
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
