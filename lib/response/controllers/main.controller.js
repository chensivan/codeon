module.exports = function(app) {
	var _ = require('underscore');
	console.log(" testing ");

	app.controller("MainController", ['$scope', function ($scope) {
		$scope.myVariable = 'hello world';
	}]);
};
