var STORAGE_DIRECTORY = __dirname + '/recordings/';
var mkdirp = require('./mkdirp');
var fse = require('fs-extra');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');

function getUploadURL() {
	return atom.config.get('voice-assist.uploadURL');
}

module.exports = function (uid, editorRecorder, voiceRecorder, workspaceSnapshot) {
	var changelogPromise = editorRecorder.stop(uid);
	var promises = voiceRecorder.stop(uid),
		wavPromise = promises.wav,
		transcriptPromise = promises.transcript;

	var wavFilePromise = wavPromise.then(function(wavFilename) {
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

	return Promise.all([wavFilePromise, infoPromise]).then(function() {
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
		var form = new FormData();
		form.append('recording', fs.createReadStream(zipFilename));
		return new Promise(function(resolve, reject) {
			form.submit(getUploadURL(), function(err, result) {
				if(err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}).then(function(zipFilename) {
		console.log("Uploaded to " + getUploadURL());
	}, function(err) {
		console.error(err.stack);
	});
};
