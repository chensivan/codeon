var diff = require("node-diff3").diff
var jsdiff = require("diff");

module.exports = function(app) {
	var _ = require('underscore');
	console.log(" testing ");

	app.controller("MainController", ['$scope','$rootScope','$timeout', 'QuestionManager', function ($scope,$rootScope,$timeout,QuestionManager) {
	var req = "Request: ",
			resT = "Response Type: ",
			resC = "Response Content: ";

	$scope.myArr = [
									{
										id: 'q1',
										request: req+"what does this function do",
										status: "solved",
										responseContent: [
											{
												type: resT+'code',
												response: '1\n3\n4',
												location: [[103,3],[103,8]]
											},
											{
												type: resT+'annotation',
												response: 'def',
												location: [[47,1],[47,8]]
											},
											{
												type: resT+'explanation',
												response: 'def'
											}
										]
									}
								];


	QuestionManager.on('response', function(response) {
		//TODO: fix
		atom.notifications.addSuccess("You received one response for this question:\n "+response.id
																	+"\n the response is: "+response.responseContent);
		console.log(response);
	});


	$scope.width = '600px';
	$scope.bgColor = 'green';



	$scope.myClick = function(obj){
	  $rootScope.isRejecting = false;

		$scope.selectedObj = obj;
	}
	// $scope.myVariable = 'hello world';


	$scope.subResponseClick = function(response){

		editor = atom.workspace.getActiveTextEditor();



		// editor.setSelectedBufferRanges([obj.highlight1, obj.highlight2]);
		// editor.scrollToScreenPosition(obj.highlight1[0],{center:true})

		if (response.type == "Response Type: code"){

			//get the current editor Content
			var currentDev = editor.getText();
			var currentRes = response.response;
			var original = currentDev;
			//use diff merge

			var merge = diff.merge([original],[currentDev],[currentRes])

			var codeDiff = jsdiff.diffLines(currentDev,merge.result[0]);

			//empty editor
			editor.setText("")


			//start writing the code diff
			codeDiff.forEach(function(part,index){
				var color = part.added ? 'add': part.removed? 'delete':'nothingchanged';
				// debugger;
				//write this line
				editor.insertText(part.value)
				editor = atom.workspace.getActiveTextEditor();

				var marker = editor.markScreenPosition([index,0],{invalidate:'never'});

				editor.decorateMarker(marker, {type:'line', class:color});

				//
				// var marker = editor.markScreenPosition([index,0],{invalidate:'never'});
				//
				//
				// editor.decorateMarker(marker, {type:'line', class:color});


				//change the line color

			});


			console.log(codeDiff);
			console.log(merge.result[0]);
			// editor.setText(merge.result[0]);
			//use diff to find difference

			//editor.setSelectedBufferRange([[2,2],[4,4]]);

			console.log(response.location);
		}

		if(response.type == "Response Type: annotation"){
			console.log(response.location);
		}

		if(response.type == "Response Type: explanation"){
			console.log(response.response);

		}

	}









// 	$timeout(function(){
// 		$scope.myArr.push({id:'q3'});
// 	}, 2000);
}]);


};
