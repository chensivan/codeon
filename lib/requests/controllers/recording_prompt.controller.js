module.exports = function(app, _parent) {
	var _ = require('underscore');

	app.controller("RequestPromptController", ['$scope','$rootScope','$timeout',function ($scope,$rootScope,$timeout) {
		var COUNT_FROM = 2;
		$scope.requestTitle;
		$scope.COUNTDOWN_NUMBER = COUNT_FROM + 1;
		$scope.COUNTDOWN = false
		$scope.isRecording = false;
		$scope.requestTitle = "";

		function closePrompt() {

			$timeout(function(){
				_parent.toggle($scope.requestTitle);
			},0,false);
		}

		function decrementCounter() {
			$scope.COUNTDOWN_NUMBER--;

			if($scope.COUNTDOWN_NUMBER==0) {
				$scope.COUNTDOWN = false;
				$scope.COUNTDOWN_NUMBER = COUNT_FROM + 1;
				_parent.closePrompt();


				closePrompt();
			} else {
				$timeout(decrementCounter, 1000);
			}
		}

		$scope.startRecording = function() {

			$scope.COUNTDOWN = true;
			decrementCounter();
		};
		$scope.cancelPrompt = function() {
			$scope.COUNTDOWN = false;
			debugger;
			$timeout(function(){
				_parent.closePrompt();
			});
		};
	}]);
};
