module.exports = function(app) {
	var _ = require('underscore');
	console.log(" testing ");

	app.controller("MainController", ['$scope','$timeout', function ($scope,$timeout) {

		$scope.myArr = [
							{id: 'q1'},
							{id: 'q2'}
						];
		$scope.myClick = function(obj){
			$scope.selectedObj = obj;
		}
		// $scope.myVariable = 'hello world';

		$timeout(function(){
			$scope.myArr.push({id:'q3'});
		}, 2000);
	}]);


};
