module.exports = function(app, _parent) {
	var _ = require('underscore');

	app.controller("RequestPromptController", ['$scope','$rootScope','$timeout',function ($scope,$rootScope,$timeout) {
		var COUNT_FROM = 2;
		$scope.requestTitle;
		$scope.COUNTDOWN_NUMBER = COUNT_FROM + 1;
		$scope.COUNTDOWN = false

		function closePrompt() {
			_parent.closePrompt();
			_parent.toggle($scope.requestTitle);

			$scope.COUNTDOWN = false;
			$scope.COUNTDOWN_NUMBER = COUNT_FROM + 1;
			$scope.requestTitle = "";
		}

		function decrementCounter() {
			$scope.COUNTDOWN_NUMBER--;

			if($scope.COUNTDOWN_NUMBER==0) {
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
			_parent.closePrompt();
		};
	}]);
};
