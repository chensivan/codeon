var recorder = require('./requests/recorderMain');
var response = require('./response/responseMain');

module.exports= {
 activate: function(){
   // activate voice-assist
   recorder.initialize();

   // activate response vizView
   response.initialize();
 },
 config: {
   uploadURL: {
     title: 'Upload URL',
     // default: 'http://107.170.177.159:3000/upload_recording',
     default: 'http://localhost:3000/upload_recording',
     type: 'string'
    },
   contactinfo: {
     title: 'Skype Username',
     default: 'NA',
     type: 'string'
   }
 }
};
