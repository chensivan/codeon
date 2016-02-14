module.exports = function(app) {
	var _ = require('underscore');
	console.log(" testing ");

	app.controller("MainController", ['$scope','$timeout', function ($scope,$timeout) {
	var req = "Request: ",
			resT = "Response Type: ",
			resC = "Response Content: ";
	$scope.myArr = [
						{
							id: 'q1',
							request: req+"what does this function do",
							responseType: resT+"explanation",
							responseContent: resC+"This function is a ajax method that calls the URL to fetch the data, and you should be able to see the return value inside the success function.",
							row: 15
						},
						{id: 'q2'}
					];
	$scope.myClick = function(obj){
	  $scope.why = "";
	  console.log("w "+$scope.why)

	  if ($scope.why==""){
	    console.log("ew")

		}
		$scope.selectedObj = obj;
	}
	// $scope.myVariable = 'hello world';

// 	$timeout(function(){
// 		$scope.myArr.push({id:'q3'});
// 	}, 2000);
}]);


};
