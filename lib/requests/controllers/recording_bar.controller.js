module.exports = function(app) {
	var _ = require('underscore');

	app.controller("RecordingBarController", ['$scope','$rootScope','$timeout','Recorder', function ($scope,$rootScope,$timeout, Recorder) {
		$scope.doneRecording = function() {
			$scope.uploading=true;
 			Recorder.stop();
		};
		$scope.cancelRecording = function() {
			Recorder.cancel();
		};

	}]);
};
