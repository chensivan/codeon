var recorder = require('./requests/recorderMain');
var response = require('./response/responseMain');

var editorID;

module.exports= {
    activate: function(state) {
        if(state) {
            editorID = state.editorID;
        }

        if(!editorID) {
            editorID = guid();
        }

        // activate voice-assist
        recorder.initialize(editorID);

        // activate response vizView
        response.initialize(editorID);
    },
    serialize: function() {
        return {
            editorID: editorID
        };
    },
    deactivate: function() {
        recorder.destroy();
        response.destroy();
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
    	},
        editorID: {
    		title: 'Unique Editor ID',
    		default: guid(),
    		type: 'string'
        }
    }
};

function guid() {
    function s4() {
        return Math .floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
}