module.exports = function(app){

app.controller("HelperResponse", ['$scope','$rootScope',function ($scope,$rootScope) {
	$scope.hasReplay = false;
	var response = $scope.helper_response.response;

	//do something with response here and set $scope.hasReplay
	console.log($scope.helper_response);


}]);
};