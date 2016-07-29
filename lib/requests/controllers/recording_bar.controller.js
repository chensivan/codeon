module.exports = function(app) {
	var _ = require('underscore');

	app.controller("RecordingBarController", ['$scope','$rootScope','Recorder', function ($scope,$rootScope,Recorder) {
		$scope.doneRecording = function() {
			debugger;
			Recorder.stop();
		};
		$scope.cancelRecording = function() {
			Recorder.cancel();
		};
	}]);
};
