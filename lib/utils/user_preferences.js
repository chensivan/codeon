module.exports = {
	getServerURL: function() {
		return atom.config.get('codeon.uploadURL');
	},
	getUploadURL: function() {
		return module.exports.getServerURL()+'/upload_recording';
	},
	getContact: function() {
		return atom.config.get('codeon.contactinfo');
	},
	getEditorID: function() {
		return atom.config.get('codeon.editorID');
	},
	includeWorkspaceSnapshot: function() {
		return atom.config.get('codeon.includeWorkspaceSnapshot');
	},
	postRequestsToSlack: function() {
		return atom.config.get('codeon.postToSlack');
	},
	getSlackWebhookURL: function() {
		return atom.config.get('codeon.slackWebhook');
	},
};
