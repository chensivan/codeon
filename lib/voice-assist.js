var EventEmitter = require('events').EventEmitter;
var RecordingBarView = require('./RecordingBarView');

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

var recordingBarView;
var voiceRecorder = require('./voiceRecorder');
var editorRecorder = require('./editorRecorder');
var modalPanel;

recorder.on('start', function() {
	voiceRecorder.start();
	editorRecorder.start();
	modalPanel.show();
}).on('stop', function() {
	var changelog = editorRecorder.stop();
	var promises = voiceRecorder.stop(),
		wavPromise = promises.wav,
		transcriptPromise = promises.transcript;
	Promise.all([wavPromise, transcriptPromise]).then(function(info) {
		var wavFilename = info[0],
			transcript = info[1];
		console.log("Wav file:   ", wavFilename);
		console.log("Transcript: ", transcript);
		console.log("Changes: ", changelog)
	});
	modalPanel.hide();
}).on('cancel', function() {
	editorRecorder.cancel();
	voiceRecorder.cancel();
	modalPanel.hide();
})

module.exports = recorder;
