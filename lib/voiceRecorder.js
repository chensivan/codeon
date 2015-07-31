var _ = require('./vendor/underscore'),
	RecordRTC = require('recordrtc'),
	fs = require('fs'),
	mkdirpLib = require('mkdirp');

var RECORDING_STORAGE_DIRECTORY = __dirname + '/recordings/';

var recognitionEngine = new webkitSpeechRecognition();
recognitionEngine.continue = false;
recognitionEngine.interimResults = false;
recognitionEngine.maxResults = 1;

function guid() {
	function s4() {
		return Math	.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
}

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

function mkdirp(path) {
	return new Promise(function(resolve, reject) {
		mkdirpLib(path, function(err) {
			if(err) {
				reject(err);
			} else {
				resolve(path);
			}
		});
	});
}
var transcriptPromise, audioStreamPromise, recorder;

module.exports = {
	start: function () {
		transcriptPromise = new Promise(function(resolve, reject) {
			recognitionEngine.start();
			recognitionEngine.onresult = function(event) {
				var results = event.results,
					mostLikelyResult = results[0][0].transcript;
				resolve(mostLikelyResult);
			};
			recognitionEngine.onend = function() {
				_.delay(function() {
					resolve("");
				}, 3000);
			}
		});
		audioStreamPromise = getUserMedia().then(function(audioStream) {
			recorder = RecordRTC(audioStream);
			recorder.startRecording();
			return audioStream;
		});
	},
	stop: function() {
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
							var filename = guid() + ".wav",
								fullFilename = RECORDING_STORAGE_DIRECTORY  + filename;

							return mkdirp(RECORDING_STORAGE_DIRECTORY).then(function() {
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
