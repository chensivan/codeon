var EventEmitter = require('events').EventEmitter;
var mkdirp = require('./mkdirp');
var fs = require('fs');
var path = require('path');
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

var recordingBarView;
var voiceRecorder = require('./voiceRecorder');
var editorRecorder = require('./editorRecorder');
var workspaceSnapshot = require('./workspaceSnapshot');
var modalPanel;
var uid;

recorder.on('start', function() {
	uid = guid();
	voiceRecorder.start(uid);
	editorRecorder.start(uid);
	workspaceSnapshot.start(uid);
	modalPanel.show();
}).on('stop', function() {
	modalPanel.hide();

	var changelogPromise = editorRecorder.stop(uid);
	var promises = voiceRecorder.stop(uid),
		wavPromise = promises.wav,
		transcriptPromise = promises.transcript;

	wavPromise.then(function(wavFilename) {
		workspaceSnapshot.addFile(wavFilename, path.basename(wavFilename));
	});

	var folder = STORAGE_DIRECTORY + uid + '/';
	var infoPromise = Promise.all([transcriptPromise, changelogPromise]).then(function(info) {
		var transcript = info[0],
			changelog = info[1];

		var recordingInfo = {
			transcript: transcript,
			changelog: changelog,
		};

		var filename = 'recording.json',
			fullFilename = folder + filename;

		return mkdirp(folder).then(function() {
			return new Promise(function(resolve, reject) {
				fse.writeJson(fullFilename, recordingInfo, function(err) {
					if(err) {
						reject(err);
					} else {
						resolve(fullFilename);
					}
				});
			}).then(function() {
				return workspaceSnapshot.addFile(fullFilename, filename);
			});
		});
	});

	infoPromise.then(function() {
		return workspaceSnapshot.stop(uid);
	}).then(function(zipFilename) {
		return new Promise(function(resolve, reject) {
			fse.remove(folder, function(err) {
				if(err) {
					reject(err);
				} else {
					resolve(zipFilename);
				}
			});
		});
	}).then(function(zipFilename) {
		console.log("Wrote to " + zipFilename);
	}, function(err) {
		console.error(err.stack);
	});
}).on('cancel', function() {
	editorRecorder.cancel(uid);
	voiceRecorder.cancel(uid);
	workspaceSnapshot.cancel(uid);
	modalPanel.hide();

	var folder = STORAGE_DIRECTORY + uid + '/';
	fse.remove(folder, function() {
		console.log("done");
	});
})
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
