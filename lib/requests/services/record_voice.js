var _ = require('./vendor/underscore'),
	RecordRTC = require('recordrtc'),
	fs = require('fs'),
	pfs = require('../../utils/promised_fs'),
	path = require('path');


var RECORDING_STORAGE_DIRECTORY = path.join(__dirname, 'recordings');

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

	app.factory('VoiceRecorder', ['$q', function ($q) {
		return {
			start: function (uid) {
				transcriptResult = '';
				stopped = false;
				question_id = uid;

				transcriptPromise = new Promise(function(resolve, reject) {
					recognitionEngine.start();
					recognitionEngine.onresult = function(event) {
						var results = event.results,
							mostLikelyResult = results[0][0].transcript;
						transcriptResult += mostLikelyResult;
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
				audioStreamPromise = getUserMedia().then(function(audioStream) {
					recorder = RecordRTC(audioStream);
					recorder.startRecording();
					return audioStream;
				});
			},
			stop: function(uid) {
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
									var folder = path.join(RECORDING_STORAGE_DIRECTORY, uid),
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