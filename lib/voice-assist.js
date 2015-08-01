var EventEmitter = require('events').EventEmitter;
var mkdirp = require('./mkdirp');
var fs = require('fs');
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
	var changelogPromise = editorRecorder.stop(uid);
	var promises = voiceRecorder.stop(uid),
		wavPromise = promises.wav,
		transcriptPromise = promises.transcript;
	var zipPromise = workspaceSnapshot.stop(uid);
	Promise.all([wavPromise, transcriptPromise, changelogPromise, zipPromise]).then(function(info) {
		var wavFilename = info[0],
			transcript = info[1],
			changelog = info[2],
			zip = info[3];

		var recordingInfo = {
			wav: wavFilename,
			transcript: transcript,
			changelog: changelog,
			zip: zip
		};

		var folder = STORAGE_DIRECTORY + uid + '/',
			filename = 'recording.json',
			fullFilename = folder + filename;

		return mkdirp(folder).then(function() {
			return new Promise(function(resolve, reject) {
				var infoString;
				try {
					infoString = JSON.stringify(recordingInfo);
				} catch(e) {
					reject(e);
					return;
				}

				fs.writeFile(fullFilename, infoString, function(err) {
					if(err) {
						reject(err);
					} else {
						resolve(fullFilename);
					}
				})
			});
		});
	}).then(function(infoFile) {
		console.log(infoFile);
	}, function(err) {
		console.error(err.stack);
	});
	modalPanel.hide();
}).on('cancel', function() {
	editorRecorder.cancel(uid);
	voiceRecorder.cancel(uid);
	workspaceSnapshot.cancel(uid);
	modalPanel.hide();
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
