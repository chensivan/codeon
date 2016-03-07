var pfs = require('../../utils/promised_fs');
var prefs = require('../../utils/user_preferences');
//var angular = require('angular');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');

module.exports = function(app) {
	var changelog;

	app.factory('UploadRecording', ['$q', 'STORAGE_DIRECTORY', 'Slack', function ($q, STORAGE_DIRECTORY, Slack) {
		return function(uid, editorRecorder, voiceRecorder, workspaceSnapshot, cwd) {
			var changelogPromise = editorRecorder.stop(uid);
			var promises = voiceRecorder.stop(uid),
				wavPromise = promises.wav,
				transcriptPromise = promises.transcript;

			var wavFilePromise = wavPromise.then(function(wavFilename) {
				workspaceSnapshot.addFile(wavFilename, path.basename(wavFilename));
			});

			var folder = path.join(STORAGE_DIRECTORY, uid);
			var skype = prefs.getContact();
			var infoPromise = Promise.all([transcriptPromise, changelogPromise]).then(function(info) {
				var transcript = info[0],
					  changelog = info[1];
						console.log(transcript);
				var recordingInfo = {
					contact: skype,
					question_id: uid,
					editor_id: prefs.getEditorID(),
					transcript: transcript,
					changelog: changelog,
					cwd: cwd
				};
				/*

				var app = angular.element(document.getElementById("theList")).scope();

				app.$apply(function(){
					app.myArr.push({
														id: uid,
														request: transcript,
														status: "Status: Unsolved!",
												 });
					});
					*/

				var filename = 'recording.json',
					fullFilename = path.join(folder, filename);

				return pfs.mkdirp(folder).then(function() {
					return pfs.writeJson(fullFilename, recordingInfo).then(function() {
						return workspaceSnapshot.addFile(fullFilename, filename);
					});
				});
			});

			return Promise.all([wavFilePromise, infoPromise]).then(function() {
				return workspaceSnapshot.stop(uid);
			}).then(function(zipFilename) {
				return pfs.remove(folder).then(function() {
					return zipFilename;
				});
			}).then(function(zipFilename) {
				console.log("Wrote to " + zipFilename);
				var form = new FormData();
				form.append('recording', fs.createReadStream(zipFilename));
				return new Promise(function(resolve, reject) {
					form.submit(prefs.getUploadURL(), function(err, result) {
						if(err) {
							reject(err);
						} else {
							resolve(zipFilename);
						}
					});
				});
			}).then(function(zipFilename) {
				return pfs.remove(zipFilename);
			}).then(function() {
				return transcriptPromise;
			}).then(function(transcript) {
				if(prefs.postRequestsToSlack()) {
					console.log("why");
					console.log(transcript);
					return Slack.postRequest(uid, transcript);
				} else {
					return;
				}
			}).then(function() {
				console.log("Uploaded to " + prefs.getUploadURL());
			}, function(err) {
				console.error(err.stack);
			});
		};
	}]);
};
