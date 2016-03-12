module.exports = function(app, _parent) {
	var _ = require('underscore');

	app.controller("RequestPromptController", ['$scope','$rootScope',function ($scope,$rootScope) {
		$scope.requestTitle;
		$scope.COUNTDOWN_NUMBER = 3;
		$scope.COUNTDOWN = false
		$scope.startRecording = function() {
			$scope.COUNTDOWN = true;
			var countTimer = setInterval(function(){
				$scope.COUNTDOWN_NUMBER--;
				console.log("countdown:" + $scope.COUNTDOWN_NUMBER);
				$scope.$evalAsync();
				if($scope.COUNTDOWN_NUMBER==0){
					_parent.closePrompt();
					_parent.toggle($scope.requestTitle);
					$scope.requestTitle = "";
					$scope.COUNTDOWN = false;
					$scope.COUNTDOWN_NUMBER = 3;
					clearInterval(countTimer);
				}
			}, 1000);
		};
		$scope.cancelPrompt = function() {
			$scope.COUNTDOWN = false;
			_parent.closePrompt();
		};
	}]);
};
