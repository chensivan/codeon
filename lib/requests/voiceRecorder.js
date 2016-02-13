var _ = require('./vendor/underscore'),
	RecordRTC = require('recordrtc'),
	fs = require('fs'),
	mkdirp = require('./mkdirp');
//


var RECORDING_STORAGE_DIRECTORY = __dirname + '/recordings/';

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

var transcriptPromise, audioStreamPromise, recorder;
var question_id;
var stopped = false;
var transcriptResult;

module.exports = {
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
							var folder = RECORDING_STORAGE_DIRECTORY + uid + '/',
								filename =  'audio.wav',
								fullFilename = folder  + filename;

							return mkdirp(folder).then(function() {
									return new Promise(function(resolve, reject) {
										fs.writeFile(fullFilename, binaryContent, "binary", function(err) {
											if(err) {
												reject(err);
											} else {
												resolve(fullFilename);
											}
										});
									});
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
