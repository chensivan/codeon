var mkdirp = require('./mkdirp');
var fse = require('fs-extra');
var angular = require('angular');
var fs = require('fs');
var path = require('path');


var STORAGE_DIRECTORY = path.join(__dirname, 'recordings');
var FormData = require('form-data');

function getUploadURL() {
	return atom.config.get('voice-assist.uploadURL')+'/upload_recording';
}

function getContact() {
	return atom.config.get('voice-assist.contactinfo');
}

function getEditorID() {
	return atom.config.get('voice-assist.editorID');
}


module.exports = function (uid, editorRecorder, voiceRecorder, workspaceSnapshot, cwd) {
	var changelogPromise = editorRecorder.stop(uid);
	var promises = voiceRecorder.stop(uid),
		wavPromise = promises.wav,
		transcriptPromise = promises.transcript;

	var wavFilePromise = wavPromise.then(function(wavFilename) {
		workspaceSnapshot.addFile(wavFilename, path.basename(wavFilename));
	});

	var folder = path.join(STORAGE_DIRECTORY, uid);
	var skype = getContact();
	var infoPromise = Promise.all([transcriptPromise, changelogPromise]).then(function(info) {
		var transcript = info[0],
			changelog = info[1];

		var recordingInfo = {
			contact: skype,
			question_id: uid,
			editor_id: getEditorID(),
			transcript: transcript,
			changelog: changelog,
			cwd: cwd
		};

		var app = angular.element(document.getElementById("theList")).scope();

		app.$apply(function(){
			app.myArr.push({
												id: uid,
												request: transcript,
												status: "Status: Unsolved!",
										 });
			});

		console.log(app.myArr);




		var filename = 'recording.json',
			fullFilename = path.join(folder, filename);

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

	return Promise.all([wavFilePromise, infoPromise]).then(function() {
		return workspaceSnapshot.stop(uid);
	}).then(function(zipFilename) {
		return remove(folder).then(function() {
			return zipFilename;
		})
	}).then(function(zipFilename) {
		console.log("Wrote to " + zipFilename);
		var form = new FormData();
		form.append('recording', fs.createReadStream(zipFilename));
		return new Promise(function(resolve, reject) {
			form.submit(getUploadURL(), function(err, result) {
				if(err) {
					reject(err);
				} else {
					resolve(zipFilename);
				}
			});
		});
	}).then(function(zipFilename) {
		return remove(zipFilename);
	}).then(function() {
		console.log("Uploaded to " + getUploadURL());
	}, function(err) {
		console.error(err.stack);
	});
};

function remove(path) {
	return new Promise(function(resolve, reject) {
		console.log(path);
		fse.remove(path, function(err) {
			if(err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}
