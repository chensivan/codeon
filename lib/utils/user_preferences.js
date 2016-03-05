module.exports = {
	getServerURL: function() {
		return atom.config.get('codemand.uploadURL');
	},
	getUploadURL: function() {
		return module.exports.getServerURL()+'/upload_recording';
	},
	getContact: function() {
		return atom.config.get('codemand.contactinfo');
	},
	getEditorID: function() {
		return atom.config.get('codemand.editorID');
	},
	includeWorkspaceSnapshot: function() {
		return atom.config.get('codemand.includeWorkspaceSnapshot');
	},
	postRequestsToSlack: function() {
		return atom.config.get('codemand.postToSlack');
	},
	getSlackWebhookURL: function() {
		return atom.config.get('codemand.slackWebhook');
	},
};
