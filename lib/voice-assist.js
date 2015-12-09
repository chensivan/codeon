var EventEmitter = require('events').EventEmitter;
var fse = require('fs-extra');
var fsp = require('fs-plus');
var fs = require('fs');
var jsonfile = require('jsonfile');
var util = require('util');
var path = require('path');
var RecordingBarView = require('./RecordingBarView');
var STORAGE_DIRECTORY = path.join(__dirname,'recordings');

var CompositeDisposable, Notification, Notifications, ref;
ref = require('atom'), Notification = ref.Notification, CompositeDisposable = ref.CompositeDisposable;


var client = require('socket.io-client');
var socket = client.connect('http://localhost:3000');
//
//TODO: 2 conditions logic

// if (this is the first time trigger this package)
// 		1) check any updated responses
//		2) set socket on addNotification
// else if (this is not the first time trigger this package)
//		1) listen as always


// if (there is a data.json file)
// 		open file
//	  load all the question objectsID, and their last response timestamp
// 		send the object ID and

var file = path.join(STORAGE_DIRECTORY,'data.json');



socket.on('addNotification', function(data) {
	console.log("client connected: ");
	console.log(data);
	//read file and see if the q-id is here

	var uid = data.id;
	var message;
	console.log("   fewafew");
	var obj = new Object();
	fs.stat(file, function(err, stat){
		if (err == null){
			obj = JSON.parse(fs.readFileSync(file, 'utf8'));
			console.log(obj);

			debugger;
			if(obj.hasOwnProperty(uid)){
				console.log();
				obj[uid].response.push(data.msg);
				atom.notifications.addSuccess("You received one response for this question:\n "+data.id
																			+"\n the response is: "+data.msg);
			}
		}
	});



	// var question = msg[0];
	// var answer = msg[1];

});


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
