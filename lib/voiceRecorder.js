var _ = require('./vendor/underscore'),
	wav = require('wav');
require('./vendor/recorder/recorder')


var recognitionEngine = new webkitSpeechRecognition();
recognitionEngine.continuous = false;
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
var audioStream, wavWriter;
/*
function convertFloat32ToInt16(buffer) {
	var l = buffer.length,
		buf = new Int16Array(l);
	while (l--) {
		buf[l] = Math.min(1, buffer[l])*0x7FFF;
	}
	return buf.buffer;
}
*/

var audioStreamPromise;
var recording = false;
var recorder;

function startRecording() {
	recording = true;
	var transcriptPromise = new Promise(function(resolve, reject) {
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
	var wavName = __dirname+'/' + guid()+".wav";
	audioStreamPromise = getUserMedia().then(function(audioStream) {
		var audio_context = new AudioContext();
		var input = audio_context.createMediaStreamSource(audioStream);
		recorder = new Recorder(input);
		recorder.record();
		return audioStream;
	});
	/*

	wavWriter = new wav.FileWriter(wavName, {
			channels: 1,
			sampleRate: 44100,
			bitDepth: 16
		});
	//stream.pipe(fileWriter);

	audioStreamPromise = getUserMedia().then(function(audioStream) {
		var context = new AudioContext(),
			audioInput = context.createMediaStreamSource(audioStream),
			bufferSize = 2048,
			recorderProcessor = context.createScriptProcessor(bufferSize, 1, 1); // create a javascript node

		// specify the processing function
		recorderProcessor.onaudioprocess = function(e) {
			if(recording) {
				var left = e.inputBuffer.getChannelData(0);
				var convertedVal = convertFloat32ToInt16(left);
				console.log(left);
				wavWriter.write(convertedVal.toString());
			}
		};

		// connect stream to our recorder
		audioInput.connect(recorderProcessor);

		// connect our recorder to the previous destination
		recorderProcessor.connect(context.destination);

		return audioStream;
	});
	*/

	return transcriptPromise;
}

function stopRecording() {
	recording = false;
	//wavWriter.end();

	recognitionEngine.stop();
	audioStreamPromise.then(function(audioStream) {
		recorder.stop();
		audioStream.stop();
		recorder.exportWAV(function(blob) {
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				console.log(reader.result);
			});
			reader.readAsArrayBuffer(blob);
		});
	});
}
function cancelRecording() {
	recognitionEngine.abort();
}

module.exports = {
	start: startRecording,
	stop: stopRecording,
	cancel: cancelRecording
}

function guid() {
	function s4() {
		return Math	.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
}
