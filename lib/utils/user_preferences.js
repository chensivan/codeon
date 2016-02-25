module.exports = {
	getUploadURL: function() {
		return atom.config.get('codemand.uploadURL')+'/upload_recording';
	},
	getContact: function() {
		return atom.config.get('codemand.contactinfo');
	},
	getEditorID: function() {
		return atom.config.get('codemand.editorID');
	}
};
