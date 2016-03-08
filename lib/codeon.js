var recorder = require('./requests/request-main');
var response = require('./response/response-main');
var guid = require('./utils/guid');
var user_preferences = require('./utils/user_preferences');
//var tooltip = require('./response/tooltipMain');

module.exports= {
    activate: function(state) {
        var editorID = user_preferences.getEditorID();

        if(!editorID) {
            editorID = user_preferences.setEditorID(guid());
        }

        if(!state) {
            state = {};
        }

        //tooltip.initialize();
        // activate atom-codeon
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
    config: user_preferences.configDefaults
};
