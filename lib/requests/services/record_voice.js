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


	//
	// 	p.then(function(mediaStream) {
	// 	  // var video = document.querySelector('video');
	// 	  // video.src = window.URL.createObjectURL(mediaStream);
	// 		// var
	// 	  // video.onloadedmetadata = function(e) {
	// 			console.log("getUserMedia : audioStream received:  ");
	//
	// 			resolve(audioStream);
	// 	    // Do something with the video here.
	// 	  // };
	// 	});
	// 	p.catch(function(err) { console.log(err.name); }); // always check for errors at the end.
	//
	// 	// try {
	//  navigator.mediaDevices.getUserMedia()
	//  return new Promise(function(resolve, reject) {
	// 	 navigator.mediaDevices.getUserMedia({audio:true}).then(function(mediaStream){
	// 		    resolve(mediaStream)
	// 		});
 	// 	navigator.mediaDevices.getUserMedia({
 	// 		audio: true,
 	// 		video:false
 	// 	}).then(function(audioStream) {
 	// 		console.log("getUserMedia : audioStream received:  ");
 	// 		debugger;
 	// 		resolve(audioStream);
 	// 	}, function(err) {
 	// 		console.log("wrong");
 	// 		reject(err);
 	// 	});
	// });
	return new Promise(function(resolve, reject) {
		navigator.webkitGetUserMedia({
				audio: true
			}, function(audioStream) {
				console.log("getUserMedia : audioStream received:  ");

				resolve(audioStream);
			}, function(err) {
				console.log("wrong");
				reject(err);
			});
	});
}


module.exports = function(app) {
	var transcriptPromise, audioStreamPromise, recorder;
	var question_id;
	var audio_Stream;
	var stopped = false;
	var transcriptResult;

	app.factory('VoiceRecorder', ['$q', 'STORAGE_DIRECTORY', function ($q, STORAGE_DIRECTORY) {
		return {
			start: function (uid) {
				transcriptResult = '';
				stopped = false;
				question_id = uid;
				debugger;

				// return new Promise(function(resolve, reject){
				// 	navigator.webkitGetUserMedia({
				// 			audio: true
				// 		}, function(audioStream) {
				// 			console.log("RecordRTC startRecording now  ");
				// 			recorder = RecordRTC(audioStream);
				// 			recorder.startRecording();
				// 			audio_Stream =  audioStream;
				// 			resolve(audioStream);
				// 		}, function(err) {
				// 			console.log(err);
				// 			reject(err);
				// 		});
				// })


				audioStreamPromise = new Promise(function(resolve, reject) {

					// return navigator.webkitGetUserMedia({
		      //   audio: true,
		      //   video: true
		      // }, function(audioStream) {
					// 	console.log("getUserMedia : audioStream received:  ");
					//
					// 	resolve(audioStream);
		      // }, function() {
		      //   return done();
		      // });
					//
					return navigator.webkitGetUserMedia({
							audio: true
						}, function(audioStream) {
							console.log("getUserMedia : audioStream received:  ");

							resolve(audioStream);
						}, function(err) {
							console.log("wrong");
							reject(err);
						});
				}).then(function(audioStream) {
					console.log("RecordRTC startRecording now  ");

					recorder = RecordRTC(audioStream);
					recorder.startRecording();
					return audioStream;
				});

				// transcriptPromise = new Promise(function(resolve, reject) {
				//
				// 	recognitionEngine.start();
				// 	recognitionEngine.onerror = function(e) {
				// 		console.error('Voice Recognition Error: ' + e.error)
				// 	};
				//
				// 	recognitionEngine.onresult = function(event) {
				// 		console.log(event);
				//
				// 		var results = event.results,
				// 			mostLikelyResult = results[0][0].transcript;
				// 		transcriptResult += mostLikelyResult;
				// 		console.log("CodeOn - Voice Recognition - likely result:" + mostLikelyResult);
				// 		if(stopped) {
				// 			resolve(transcriptResult);
				// 		}
				// 	};
				// 	recognitionEngine.onend = function() {
				// 		_.delay(function() {
				// 			resolve(transcriptResult);
				// 		}, 3000);
				// 	}
				// });

			},
			stop: function(uid) {
				console.log("RecordRTC stopRecording now  ");
				stopped = true;
				// recognitionEngine.stop();

				// return new Promise(function(resolve, reject) {
				// 						recorder.stopRecording(function() {
				// 							debugger;
				// 							resolve(recorder.getBlob());
				// 						});
				// 						audio_Stream.stop();
				// 					 }).then(function(blob) {
				// 						return new Promise(function(resolve, reject) {
				// 							var fr = new FileReader();
				// 							fr.addEventListener("loadend", function() {
				// 								resolve(fr.result);
				//
				// 							})
				// 							fr.readAsBinaryString(blob);
				// 						});
				// 					 }).then(function(binaryContent) {
				// 						var folder = path.join(STORAGE_DIRECTORY, uid),
				// 							fullFilename = path.join(folder, 'audio.wav');
				//
				// 						return pfs.mkdirp(folder).then(function() {
				// 							return pfs.writeFile(fullFilename, binaryContent, 'binary');
				// 						});
				// 					 });



				var wavPromise = audioStreamPromise.then(function(audioStream) {
									return new Promise(function(resolve, reject) {
										recorder.stopRecording(function() {
											debugger;
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

				return wavPromise;


				// return new Promise(function(resolve, reject){
				// 	window.audioVideoRecorder.stopRecording(function(url) {
	      //       resolve(audioVideoRecorder.getBlob());
	      //   });
				// }).then(function(blob) {
				// 	return new Promise(function(resolve, reject) {
				// 		var fr = new FileReader();
				// 		fr.addEventListener("loadend", function() {
				// 			resolve(fr.result);
				//
				// 		})
				// 		fr.readAsBinaryString(blob);
				// 	});
				// }).then(function(binaryContent) {
				// 	var folder = path.join(STORAGE_DIRECTORY, uid),
				// 		fullFilename = path.join(folder, 'audio.wav');
				//
				// 	return pfs.mkdirp(folder).then(function() {
				// 		return pfs.writeFile(fullFilename, binaryContent, 'binary');
				// 	});
				// });


			},
			cancel: function() {
				// recognitionEngine.abort();
				audioStreamPromise.then(function(audioStream) {
					audioStream.stop();
				});
			}
		}
	}]);
};
