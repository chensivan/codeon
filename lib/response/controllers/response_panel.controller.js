var tooltip = require('../tooltipMain');
var _ = require('underscore');

module.exports = function(app) {
	app.controller("ResponsePanelController", ['$scope','$rootScope','$timeout', 'QuestionManager', function ($scope,$rootScope,$timeout,QuestionManager) {

		$scope.title = "CoDemand Requests";
		$scope.resList = true;
		$scope.responseContent = false;


		$rootScope.requests = [];
		$scope.inputs = {
			requestID: "",
			iterationMsg: ""
		};

		// setTimeout($scope.newResponse, 2000);
		$scope.$on('codemand_response', function(response) {
		//QuestionManager.on('response', function(response) {
			//TODO: fix
			// atom.notifications.addSuccess("You received one response for this question:\n "+response.id
			// 															+"\n the response is: "+response.responseContent);


			//response range
			var range = response.range;

			//
			// atom.workspace.observeTextEditors(editor => {
			//
	    //   this.editorViewMappings[editor] = new TooltipView();
			//
			//
	    //   editor._tooltipMarkers = [];
			//
	    //   // Decorate example ranges
	    //   if(exampleRangess!=null){
	    //     exampleRanges.forEach(function(range) {
			//
	    //       let marker = editor.markBufferRange(range);
	    //       editor.decorateMarker(marker, {
	    //         class: 'test-pkg-highlight',
	    //         type: 'highlight',
	    //       });
			//
	    //       editor._tooltipMarkers.push(marker);
	    //     });
	    //   }

			$scope.myArr.forEach(function(value,key){

				if(value.id == response.id){

					//change the color and status of the request
					$scope.$apply(function (){
						// $scope.myArr[key].status = "Status: Solved!";
						value['response'] = new Array();

						value.status = "Status: Solved!";
						//loop through response for multipel responses
						debugger;

						response['response'].forEach(function(val){
							value['response'].push(val);
						});
						// value['response'].push(response['response'])


						console.log($scope.myArr);
						//change panel background color to indicate the new response
						angular.element(document.getElementById(response.id)).css('background-color','green')
					})
				}

			})

			atom.notifications.addSuccess("You received one response for this question:\n "+
																		"Can you debug this function for me. \n");
																		// 	"the response is: "+response.responseContent


		});

		$scope.bgColor = 'black';


		$scope.titleClick = function(title){
			$scope.title = "CoDemand Requests";
			$scope.resList = true;
			$rootScope.isRejecting = false;
			$scope.responseContent = false;
		}


		// show the details of the clicked response
		$scope.clickRequest = function(obj){

			$scope.resList = false;
			$scope.responseContent = true;
			$scope.title = "Requests";
			$rootScope.isRejecting = false;
			$scope.selectedObj = obj;
		}

		$scope.newRequest = function(){
			//call codemand function
			
		}


	}]);
};
