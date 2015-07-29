var EventEmitter = require('events').EventEmitter;

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
	atom.commands.add('atom-workspace', 'voice-assist:toggle', this.toggle.bind(this));
	console.log("activate");
};
recorder.deactivate = function() {
	this.cancel();
};
recorder.serialize = function() {
	return {};
};

var voiceRecorder = require('./voiceRecorder');
recorder.on('start', function() {
	var transcriptPromise = voiceRecorder.start();
	transcriptPromise.then(function(transcript) {
		console.log(transcript);
	});
}).on('stop', function() {
	voiceRecorder.stop();
}).on('cancel', function() {
	voiceRecorder.cancel();
})

module.exports = recorder;
