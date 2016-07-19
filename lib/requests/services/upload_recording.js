var pfs = require('../../utils/promised_fs');
var prefs = require('../../utils/user_preferences');
//var angular = require('angular');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');

module.exports = function(app) {
	var changelog;

	app.factory('UploadRecording', ['$q', 'STORAGE_DIRECTORY', 'Slack', function ($q, STORAGE_DIRECTORY, Slack) {
		return function(uid, editorRecorder, voiceRecorder, workspaceSnapshot, cwd, requestTitle) {
			var changelogPromise = editorRecorder.stop(uid);
			var promises = voiceRecorder.stop(uid),
				wavPromise = promises.wav,
				transcriptPromise = promises.transcript;

			var wavFilePromise = wavPromise.then(function(wavFilename) {
				console.log("wavPromise : " + wavFilename);

				workspaceSnapshot.addFile(wavFilename, path.basename(wavFilename));
			});
			transcriptPromise.then(function(){
				console.log("transcriptPromise then");
			});
			changelogPromise.then(function(){
				console.log("changelogPromise then");
			});
			var folder = path.join(STORAGE_DIRECTORY, uid);
			var skype = prefs.getContact();
			var infoPromise = Promise.all([transcriptPromise, changelogPromise]).then(function(info) {

				var transcript = info[0],
					  changelog = info[1];
						console.log("transcript(infoPromise) : " + transcript);
				var recordingInfo = {
					contact: skype,
					title : requestTitle,
					question_id: uid,
					editor_id: prefs.getEditorID(),
					transcript: transcript,
					changelog: changelog,
					cwd: cwd
				};

				//add gutter icon to indicate the location, which should be the same as showlocation
				var editor = atom.workspace.getActiveTextEditor();

				_.every(changelog, function(obj){
					if(obj.type=='cursor'){
						editor.scrollToScreenPosition(obj.cursor,{center:true});
						editor.setCursorScreenPosition(obj.cursor);
						return false;
					}

					if(obj.type=='selection_range'){
						editor.scrollToScreenPosition(obj.range[0],{center:true});
						editor.setCursorScreenPosition(obj.range[0]);
						return false;
					}

					return true;
				});



				var filename = 'recording.json',
					fullFilename = path.join(folder, filename);

				return pfs.mkdirp(folder).then(function() {
					debugger;
					return pfs.writeJson(fullFilename, recordingInfo).then(function() {
						return workspaceSnapshot.addFile(fullFilename, filename);
					});
				});
			});

			return Promise.all([wavFilePromise, infoPromise]).then(function() {
				console.log("transcript(wavFilePromise, infoPromise) : ");

				return workspaceSnapshot.stop(uid);
			}).then(function(zipFilename) {
				console.log("transcript(wavFilePromise, infoPromise)2 : " );

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

					console.log("transcription2: " + transcript);
					return Slack.postRequest(uid, transcript);
				} else {
					return;
				}
			}).then(function() {
				console.log("Uploaded to " + prefs.getUploadURL());
				 //stop the feedback

			}, function(err) {
				console.error(err.stack);
			});
		};
	}]);
};
