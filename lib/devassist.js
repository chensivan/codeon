var recorder = require('./requests/recorderMain');
var response = require('./response/responseMain');

module.exports= {
 activate: function(){
   // activate voice-assist
   recorder.initialize();

   // activate response vizView
   response.initialize();
 }
}
