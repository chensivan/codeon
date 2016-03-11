module.exports = function(app, _parent) {
	var _ = require('underscore');

	app.controller("RequestPromptController", ['$scope','$rootScope',function ($scope,$rootScope) {
		$scope.requestTitle;
		$scope.startRecording = function() {
			_parent.closePrompt();
			_parent.toggle($scope.requestTitle);
			$scope.requestTitle = "";
		};
		$scope.cancelPrompt = function() {
			_parent.closePrompt();
		};
	}]);
};
