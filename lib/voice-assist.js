var EventEmitter = require('events').EventEmitter;
var fse = require('fs-extra');
var RecordingBarView = require('./RecordingBarView');
var STORAGE_DIRECTORY = __dirname + '/recordings/';

var recorder = new EventEmitter();

recorder._recording = false;
recorder.start = function() {
	if(!this.isRecording()) {
		this.emit("start");
		this._recording = true;
	}
};
recorder.stop = function() {
	if(this.isRecording()) {
		this._recording = false;
		this.emit("stop");
	}
};
recorder.cancel = function() {
	if(this.isRecording()) {
		this._recording = false;
		this.emit("cancel");
	}
};
recorder.isRecording = function() {
	return this._recording;
};
recorder.toggle = function() {
	return this.isRecording() ? this.stop() : this.start();
};
recorder.activate = function() {
	recordingBarView = new RecordingBarView();

	recordingBarView.$getElement().on('done', function() {
			recorder.stop();
		}).on('cancel', function() {
			recorder.cancel();
		});
	modalPanel = atom.workspace.addTopPanel({
		item: recordingBarView.getElement(),
		visible: false
	});
	atom.commands.add('atom-workspace', 'voice-assist:toggle', this.toggle.bind(this));
};
recorder.deactivate = function() {
	if(modalPanel) {
		modalPanel.destroy();
		modalPanel = false;
	}
	this.cancel();
	if(recordingBarView) {
		recordingBarView.destroy();
	}
};
recorder.serialize = function() {
	return {};
};
recorder.config = {
	uploadURL: {
		title: 'Upload URL',

		// default: 'http://107.170.177.159:3000/upload_recording',
		default: 'http://localhost:3000/upload_recording',

		// default: 'http://107.170.177.159:3000/upload_recording',
		//default: 'http://localhost:3000/upload_recording',

		type: 'string'
	},
	contactinfo: {
		title: 'Skype Username',
		default: 'NA',
		type: 'string'
	}
};


var recordingBarView;
var voiceRecorder = require('./voiceRecorder');
var editorRecorder = require('./editorRecorder');
var workspaceSnapshot = require('./workspaceSnapshot');
var uploadRecording = require('./uploadRecording');
var modalPanel;
var uid;
var cwd;

recorder.on('start', function() {
	uid = guid();
	cwd = workspaceSnapshot.start(uid);
	voiceRecorder.start(uid);
	editorRecorder.start(uid, cwd);
	modalPanel.show();
}).on('stop', function() {
	modalPanel.hide();
	uploadRecording(uid, editorRecorder, voiceRecorder, workspaceSnapshot, cwd);
}).on('cancel', function() {
	editorRecorder.cancel(uid);
	voiceRecorder.cancel(uid);
	workspaceSnapshot.cancel(uid);
	modalPanel.hide();

	var folder = STORAGE_DIRECTORY + uid + '/';
	fse.remove(folder, function() {
		console.log("done");
	});
});
function guid() {
	function s4() {
		return Math	.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
}

module.exports = recorder;
