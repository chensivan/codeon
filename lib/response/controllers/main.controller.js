var diff = require("node-diff3").diff
var jsdiff = require("diff");
var tooltip = require('../tooltipMain');


module.exports = function(app) {
	var _ = require('underscore');
	console.log(" testing ");

	app.controller("MainController", ['$scope','$rootScope','$timeout', 'QuestionManager', function ($scope,$rootScope,$timeout,QuestionManager) {
	var req = "Request: ",
			resT = "Response Type: ",
			resC = "Response Content: ";

	$scope.title = "Response List";
	$scope.resList = true;
	$scope.responseContent = false;

	$scope.inputs = {
		requestID: "",
		iterationMsg: ""
	};

	$scope.myArr = [
									{
										id: '1',
										request: "Can you debug this function for me",
										status: "Status: Unsolved!",
										responseContent: [
											{
												type: resT+'code',
												response: 'var c9server = require(\'./cromac9/server\');',
												location: [[2,0],[2,20]]
											},
											{
												type: resT+'annotation',
												response: 'Make sure you have the right ipAddress here',
												location: [[87,43],[87,52]]
											},
											{
												type: resT+'explanation',
												response: 'This function take an ip address as an input and create a copy of developers codebase to that ip adress.'
											}
										]
									},
									{
										id: '2',
										request: "Hey",
										status: "Status: Unsolved!"
									}
								];
	// setTimeout($scope.newResponse, 2000);


	QuestionManager.on('response', function(response) {
		//TODO: fix
		// atom.notifications.addSuccess("You received one response for this question:\n "+response.id
		// 															+"\n the response is: "+response.responseContent);

		console.log(" teeeee ");
		console.log(response);
		$scope.myArr.forEach(function(value,key){
			console.log(value.id+" "+response.id);
			console.log(" testing ");
			console.log(value);
			if(value.id == response.id){

				//change the color and status of the request
				$scope.$apply(function (){
					// $scope.myArr[key].status = "Status: Solved!";

						value.status = "Status: Solved!";
						//loop through response for multipel responses
						//
						response['response'].forEach(function(value,key){

						});


						angular.element(document.getElementById(response.id)).css('background-color','green')
				})
			}

		})

		atom.notifications.addSuccess("You received one response for this question:\n "+
																	"Can you debug this function for me. \n");
																	// 	"the response is: "+response.responseContent


	});


	$scope.width = '286px';
	$scope.bgColor = 'yellow';


	// send out the iteration message
	$scope.iterate = function(msg){
		console.log(msg);
		$scope.inputs.iterationMsg = "";
		$rootScope.isRejecting = false;

		$scope.$apply(function (){
			// $scope.myArr[key].status = "Status: Solved!";
				value.status = "Status: Unsolved!";
				angular.element(document.getElementById(response.id)).css('background-color','white')
		})

	}


	$scope.titleClick = function(title){
		$scope.title = "Response List";
		$scope.resList = true;
		$rootScope.isRejecting = false;
		$scope.responseContent = false;
	}

	// show the details of the clicked response
	$scope.myClick = function(obj){
		$scope.resList = false;
	  $scope.responseContent = true;
	  $scope.title = "Click here to go back to response list";
	  $rootScope.isRejecting = false;
		$scope.selectedObj = obj;


	}

	$scope.replay = function(obj){

			atom.workspace.open();
			console.log(obj);
			// need to access myArr[obj].livewriting_logs
			// set the enw tab with myArr[obj].livewriting_logs.initial_text

	}

	//show each sub-response within one response if there are some
	$scope.subResponseClick = function(response){

		editor = atom.workspace.getActiveTextEditor();


		if (response.type == "Response Type: code"){
			editor.scrollToScreenPosition([2,0],{center:true})
			var marker = editor.markScreenPosition([2,0],{invalidate:'never'});
			editor.decorateMarker(marker, {type:'line', class:'delete'});
			var marker = editor.markScreenPosition([3,0],{invalidate:'never'});
			editor.decorateMarker(marker, {type:'line', class:'add'});



			// get the current editor Content
			// var currentDev = editor.getText();
			// var currentRes = response.response;
			// var original = currentDev;
			// //use diff merge
			//
			// var merge = diff.merge([original],[currentDev],[currentRes])
			//
			// var codeDiff = jsdiff.diffLines(currentDev,merge.result[0]);
			//
			// //empty editor
			// editor.setText("")
			//
			//
			// //start writing the code diff
			// codeDiff.forEach(function(part,index){
			// 	var color = part.added ? 'add': part.removed? 'delete':'nothingchanged';
			// 	// debugger;
			// 	//write this line
			// 	editor.insertText(part.value)
			// 	editor = atom.workspace.getActiveTextEditor();
			//
			// 	var marker = editor.markScreenPosition([index,0],{invalidate:'never'});
			//
			// 	editor.decorateMarker(marker, {type:'line', class:color});
			//
			// 	//
			// 	// var marker = editor.markScreenPosition([index,0],{invalidate:'never'});
			// 	//
			// 	//
			// 	// editor.decorateMarker(marker, {type:'line', class:color});
			//
			//
			// 	//change the line color
			//
			// });
			//
			//
			// console.log(codeDiff);
			// console.log(merge.result[0]);
			// // editor.setText(merge.result[0]);
			// //use diff to find difference
			//
			// //editor.setSelectedBufferRange([[2,2],[4,4]]);

			console.log(response.location);
		}


		if(response.type == "Response Type: annotation"){
			console.log(response.location[0]);
			editor.setSelectedBufferRange(response.location);
			editor.scrollToScreenPosition(response.location[0],{center:true})
			editor.setCursorScreenPosition([87,45])

			tooltip.initialize();

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
