module.exports = function(app) {
	var _ = require('underscore');

	app.controller("RecordingBarController", ['$scope','$rootScope','Recorder', '$timeout',function ($scope,$rootScope,Recorder,$timeout) {
		var COUNT_FROM = 3;
		$scope.requestTitle;
		$scope.COUNTDOWN_NUMBER = COUNT_FROM + 1;
		$scope.COUNTDOWN = false;
		$scope.isRecording = false;

		function startRecording() {
			//_parent.toggle($scope.requestTitle);
			$scope.COUNTDOWN = false;
			$scope.COUNTDOWN_NUMBER = COUNT_FROM + 1;
			Recorder.start();
			$scope.isRecording = true;

		}

		function decrementCounter() {
			$scope.COUNTDOWN_NUMBER--;

			if($scope.COUNTDOWN_NUMBER==0) {
				startRecording();
			} else {
				$timeout(decrementCounter, 1000);
			}
		}

		$scope.startCountdown = function() {
			$scope.COUNTDOWN = true;
			decrementCounter();
		};
		$scope.reset = function(){
			$scope.isRecording = false;
			$scope.requestTitle = "";
		}
		$scope.doneRecording = function() {

			Recorder.stop($scope.requestTitle);
		};
		$scope.cancelRecording = function() {
			Recorder.cancel();
			$scope.isRecording = false;
		};

	}]);
};
