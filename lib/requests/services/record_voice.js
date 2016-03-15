var _ = require('underscore'),
	RecordRTC = require('recordrtc'),
	fs = require('fs'),
	pfs = require('../../utils/promised_fs'),
	path = require('path');

var recognitionEngine = new webkitSpeechRecognition();
recognitionEngine.continue = true;
recognitionEngine.interimResults = false;
recognitionEngine.maxResults = 1;

function getUserMedia() {
	return new Promise(function(resolve, reject) {
		try {
			navigator.webkitGetUserMedia({
				audio: true
			}, function(audioStream) {
				console.log("getUserMedia : audioStream received:  ");

				resolve(audioStream);
			}, function(err) {
				reject(err);
			});
		} catch (e) {
			reject("Your browser does not support WebRTC. Please try the latest version of Chrome.");
		}
	});
}

module.exports = function(app) {
	var transcriptPromise, audioStreamPromise, recorder;
	var question_id;
	var stopped = false;
	var transcriptResult;

	app.factory('VoiceRecorder', ['$q', 'STORAGE_DIRECTORY', function ($q, STORAGE_DIRECTORY) {
		return {
			start: function (uid) {
				transcriptResult = '';
				stopped = false;
				question_id = uid;

				transcriptPromise = new Promise(function(resolve, reject) {
					recognitionEngine.start();
					recognitionEngine.onerror = function(e) {
						console.error('Voice Recognition Error: ' + e.error)
					};

					recognitionEngine.onresult = function(event) {
						console.log(event);
						var results = event.results,
							mostLikelyResult = results[0][0].transcript;
						transcriptResult += mostLikelyResult;
						console.log("CodeOn - Voice Recognition - likely result:" + mostLikelyResult);
						if(stopped) {
							resolve(transcriptResult);
						}
					};
					recognitionEngine.onend = function() {
						_.delay(function() {
							resolve(transcriptResult);
						}, 3000);
					}
				});
				console.log("generating : audioStreamPromise now  ");

				audioStreamPromise = getUserMedia().then(function(audioStream) {
					console.log("RecordRTC startRecording now  ");

					recorder = RecordRTC(audioStream);
					recorder.startRecording();
					return audioStream;
				});
			},
			stop: function(uid) {
				console.log("RecordRTC stopRecording now  ");
				stopped = true;
				recognitionEngine.stop();
				var wavPromise = audioStreamPromise.then(function(audioStream) {
									return new Promise(function(resolve, reject) {
										recorder.stopRecording(function() {
											resolve(recorder.getBlob());
										});
										audioStream.stop();
									});
								}).then(function(blob) {
									return new Promise(function(resolve, reject) {
										var fr = new FileReader();
										fr.addEventListener("loadend", function() {
											resolve(fr.result);

										})
										fr.readAsBinaryString(blob);
									});
								}).then(function(binaryContent) {
									var folder = path.join(STORAGE_DIRECTORY, uid),
										fullFilename = path.join(folder, 'audio.wav');

									return pfs.mkdirp(folder).then(function() {
										return pfs.writeFile(fullFilename, binaryContent, 'binary');
									});
								});

				return {
					transcript: transcriptPromise,
					wav: wavPromise
				};
			},
			cancel: function() {
				recognitionEngine.abort();
				audioStreamPromise.then(function(audioStream) {
					audioStream.stop();
				});
			}
		}
	}]);
};
