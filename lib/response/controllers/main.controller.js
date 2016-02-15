module.exports = function(app) {
	var _ = require('underscore');
	console.log(" testing ");

	app.controller("MainController", ['$scope','$rootScope','$timeout', 'QuestionManager', function ($scope,$rootScope,$timeout,QuestionManager) {
	var req = "Request: ",
			resT = "Response Type: ",
			resC = "Response Content: ";
			location1 = "Modified Line Number: "
	$scope.myArr = [
						{
							id: 'q1',
							request: req+"what does this function do",
							responseType: resT+"explanation",
							responseContent: resC+"This function is a ajax method that calls the URL to fetch the data, and you should be able to see the return value inside the success function.",
							highlight1: [[2,2],[4,4]],
							highlight2: [[7,3],[7,8]]
						},
						{
							id: 'q2',
							request: req+"where did i call this func",
							responseType: resT+"annotation",
							responseContent: resC,
							highlight1: [[103,3],[103,8]],
							highlight2: [[15,12],[15,14]]
						}
					];


	$scope.myClick = function(obj){
	  $rootScope.isRejecting = false;
	  editor = atom.workspace.getActiveTextEditor();

		editor.setSelectedBufferRanges([obj.highlight1, obj.highlight2]);
		editor.scrollToScreenPosition(obj.highlight1[0],{center:true})
		// editor.setSelectedBufferRange([[2,2],[4,4]]);

		$scope.selectedObj = obj;
	}
	// $scope.myVariable = 'hello world';












// 	$timeout(function(){
// 		$scope.myArr.push({id:'q3'});
// 	}, 2000);
}]);


};
