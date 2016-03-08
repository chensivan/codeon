var recorder = require('./requests/request-main');
var response = require('./response/response-main');
var guid = require('./utils/guid');
//var tooltip = require('./response/tooltipMain');

module.exports= {
    activate: function(state) {
        var editorID = atom.config.get('codemand.editorID');

        if(!editorID) {
            editorID = guid();
            atom.config.set('codemand.editorID', editorID);
        }

        if(!state) {
            state = {};
        }

        //tooltip.initialize();
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
    		// default: 'http://107.170.177.159:3000',
    		default: 'http://localhost:3000',
    		type: 'string'
    	},
    	contactinfo: {
    		title: 'Skype Username',
    		default: '',
    		type: 'string'
    	},
        editorID: {
    		title: 'Unique Editor ID',
    		default: '',
    		type: 'string'
        },
        includeWorkspaceSnapshot: {
            title: 'Include Complete Workspace in Requests',
            default: false,
            type: 'boolean'
        },
        postToSlack: {
            title: 'Post requests to Slack',
            default: false,
            type: 'boolean'
        },
        slackWebhook: {
            title: 'Slack WebHook URL',
            default: 'https://hooks.slack.com/services/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',
            type: 'string'
        }
    }
};
