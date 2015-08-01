var _ = require('./vendor/underscore'),
	fs = require('fs');

var changelog;


var onChangeCursorPosition = _.throttle(function(editor, event) {
	pushChange("cursor", {
		editorID: editor.id
	});
}, 500);
var onChangeSelectionRange = _.throttle(function(editor, event) {
	pushChange("selection_range", {
		editorID: editor.id
	});
}, 500);

function onChange(editor, event) {
	pushChange("delta", {
		editorID: editor.id
	});
	console.log(arguments);
}

var cursorChangeListeners = [],
	selectionChangeListeners = [],
	changeListeners = [];
function disposeListeners() {
	_.each(cursorChangeListeners.concat(selectionChangeListeners, changeListeners), function(listener) {
		listener.dispose();
	});
}

function pushChange(type, info) {
	var item = _.extend(info || {}, {
		type: type,
		timestamp: (new Date().getTime())
	});
	changelog.push(item);
}
module.exports = {
	start: function () {
		changelog = [];
		console.log('start editor recorder');
		atom.workspace.observeTextEditors(function(editor) {
			pushChange("start", {
				text: editor.getText(),
				path: editor.getPath(),
				editor: editor.serialize()
			});
			cursorChangeListeners.push(editor.onDidChangeCursorPosition(onChangeCursorPosition.bind(this, editor)));
			selectionChangeListeners.push(editor.onDidChangeSelectionRange(onChangeSelectionRange.bind(this, editor)));
			changeListeners.push(editor.onDidStopChanging(onChange.bind(this, editor)));
		});
	},
	stop: function() {
		disposeListeners();
		pushChange("end", {
		});
		return changelog;
	},
	cancel: function() {
		disposeListeners();
	}
};
