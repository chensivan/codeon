var recorder = require('./requests/request-main');
var response = require('./response/response-main');
var tooltip = require('./response/tooltipMain');

module.exports= {
    activate: function(state) {
        var editorID = atom.config.get('voice-assist.editorID');

        if(!editorID) {
            editorID = guid();
            atom.config.set('voice-assist.editorID', editorID);
        }

        if(!state) {
            state = {};
        }

        tooltip.initialize();
        // activate voice-assist
        recorder.initialize(editorID, state.recorder);

        // activate response vizView
        response.initialize(editorID, state.response);
    },
    serialize: function() {
        return {
            editorID: editorID,
            recorder: recorder.serialize(),
            response: response.serialize()
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
    		default: 'http://localhost:3000',
    		type: 'string'
    	},
    	contactinfo: {
    		title: 'Skype Username',
    		default: 'NA',
    		type: 'string'
    	},
        editorID: {
    		title: 'Unique Editor ID',
    		default: '',
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
