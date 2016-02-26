module.exports = {
	getServerURL: function() {
		return atom.config.get('codemand.uploadURL');
	},
	getUploadURL: function() {
		return getServerURL()+'/upload_recording';
	},
	getContact: function() {
		return atom.config.get('codemand.contactinfo');
	},
	getEditorID: function() {
		return atom.config.get('codemand.editorID');
	}
};
