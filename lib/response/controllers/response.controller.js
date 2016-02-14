module.exports = function(app){

app.controller("ShowRequest", ['$scope','$rootScope','QuestionManager',function ($scope,$rootScope,QuestionManager) {

	$scope.nah = function(obj){
		QuestionManager.rejectResponse($rootScope.why);
		$rootScope.isRejecting = !$rootScope.isRejecting;
	};

}]);


};
