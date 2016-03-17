module.exports = function(app, _parent) {
	var _ = require('underscore');

	app.controller("RequestPromptController", ['$scope','$rootScope','$timeout',function ($scope,$rootScope,$timeout) {
<<<<<<< HEAD
		var COUNT_FROM = 1;
		
=======
		var COUNT_FROM = 2;
>>>>>>> a2f718b41eed81258eb55663520350632bd23451
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
