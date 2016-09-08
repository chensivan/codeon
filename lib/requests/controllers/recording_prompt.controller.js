module.exports = function(app, _parent) {
	var _ = require('underscore');

	app.controller("RequestPromptController", ['$scope','$rootScope','$timeout', function ($scope,$rootScope,$timeout) {

		var COUNT_FROM = 2;
		$scope.COUNTDOWN_NUMBER = COUNT_FROM+1;
		$scope.COUNTDOWN = false
		$scope.isRecording = false;

		function closePrompt() {
			$timeout(function(){
				_parent.toggle($scope.requestTitle);
			},0,false);
		}

		function decrementCounter() {
			if($scope.COUNTDOWN_NUMBER==0) {
				$scope.COUNTDOWN = false;
				$scope.COUNTDOWN_NUMBER = COUNT_FROM+1;
				$timeout(function () {
					_parent.closePrompt();
				}).then(function(){
					closePrompt();
				});
			} else {
				$timeout(function(){
					$scope.COUNTDOWN_NUMBER--;
					decrementCounter()
				}, 1000);
			}

		}

		$scope.startRecording = function() {
			$scope.COUNTDOWN = true;

			var sc = angular.element(document.querySelector('#recordingSpan')).scope();
			$timeout(function(){
				sc.$apply(function(){
					sc.uploading = false;
				})
			},0,false).then(function(){
				$timeout(function(){
					decrementCounter();
				},0,false);
			})



		};
		$scope.cancelPrompt = function() {

			$scope.requestTitle = "";
			$scope.COUNTDOWN = false;
			var scope = angular.element(document.querySelector('#makeRequest')).scope();
			$timeout(function(){
				scope.$apply(function(){
					scope.reqSideBarButton = true;
				});
			},0,false);
			$timeout(function(){
				_parent.closePrompt();
			});
		};
	}]);
};
