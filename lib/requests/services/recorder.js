var guid = require('../../utils/guid');
module.exports = function(app) {
	var uid, cwd, requestTitle;
	return app.factory('Recorder', ['$rootScope', 'EditorRecorder',
						'FileRecorder', 'VoiceRecorder', 'UploadRecording',
					function ($rootScope, EditorRecorder, FileRecorder, VoiceRecorder, UploadRecording) {
		var recorder = {
			recording: false,
			isRecording: function() {
				return this.recording;
			},
			setRecording: function(val) {
				if(this.recording !== val) {
					this.recording = val;

					if(this.isRecording()) {
						$rootScope.$emit('begin_codeon_recording');
					} else {
						$rootScope.$emit('end_codeon_recording');
					}
				}
			},
			start: function(title) {
				if(!this.isRecording()) {
					this.setRecording(true);
					uid = guid();
					cwd = FileRecorder.start(uid);
					requestTitle = title;
					EditorRecorder.start(uid, cwd);
					VoiceRecorder.start(uid);
				}
			},
			stop: function() {
				if(this.isRecording()) {
					this.setRecording(false);
					//EditorRecorder.stop();
					//FileRecorder.stop();
					//VoiceRecorder.stop();

					UploadRecording(uid, EditorRecorder, VoiceRecorder, FileRecorder, cwd, requestTitle);
				}
			},
			cancel: function() {
				if(this.isRecording()) {
					this.setRecording(false);
					EditorRecorder.cancel(uid);
					FileRecorder.cancel(uid);
					VoiceRecorder.cancel(uid);
				}
			},
			toggle: function() {
				return this.isRecording() ? this.stop() : this.start();
			}
		};

		return recorder;
	}]);
};
/*
var recorder = new EventEmitter();

recorder._recording = false;
recorder.start = function() {
	if(!this.isRecording()) {

		// atom.notifications.addSuccess("Success: This is a successful notification");
		// atom.notifications.addWarning("Warning: This is a good notification");
		// atom.notifications.addError("Error: This is a good notification");
		// atom.notifications.addInfo("Info: This is a good notification");
		// var a = atom.notifications.getNotifications();
		// Notifications.addNotificationView(a[2]);
		// console.log(a[2]);


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
var uploadRecording = require('./uploadRecording');
var modalPanel;
var uid;
var cwd;

recorder.on('start', function() {
	uid = guid();

	var obj = new Object();
	fs.stat(file, function(err, stat){
			console.log(err);
		if (err == null){
			obj = JSON.parse(fs.readFileSync(file, 'utf8'));
			obj[uid] = {
				id: uid,
				response: []
			}
		  jsonfile.writeFile(file, obj, function (err) {
		    console.error(err)
		  })
		}else if(err.code === 'ENOENT') {
			obj[uid] = {
						id: uid,
						response: []
					}
			console.log("ok");
		  jsonfile.writeFile(file, obj, function (err) {
		    console.error(err)
		  })
		}else{
			console.log(" some thing wrong");
		}
	})


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

module.exports = recorder;
*/
