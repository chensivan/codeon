var _ = require('./vendor/underscore'),
	fs = require('fs');

function onChangeCursorPosition() {
	console.log("cursor position changed");
}

function onChangeSelectionRange() {
	console.log("selection range changed");
}

atom.workspace.observeTextEditors(function(editor) {
});
var disposeCursorChangeListener,
	disposeSelectionChangeListener;
function disposeListeners() {
	disposeCursorChangeListener.dispose();
	disposeSelectionChangeListener.dispose();
}
module.exports = {
	start: function () {
		disposeCursorChangeListener = editor.onDidChangeCursorPosition(onChangeCursorPosition);
		disposeSelectionChangeListener = editor.onDidChangeSelectionRange(onChangeSelectionRange);
	},
	stop: function() {
		disposeListeners();
	},
	cancel: function() {
		disposeListeners();
	}
};
