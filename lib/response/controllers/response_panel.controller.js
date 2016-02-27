var diff = require("node-diff3").diff
var jsdiff = require("diff");
var tooltip = require('../tooltipMain');
var _ = require('underscore');

module.exports = function(app) {
	app.controller("ResponsePanelController", ['$scope','$rootScope','$timeout', 'QuestionManager', function ($scope,$rootScope,$timeout,QuestionManager) {

		$scope.title = "Response List";
		$scope.resList = true;
		$scope.responseContent = false;

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

		$scope.bgColor = 'yellow';


		$scope.titleClick = function(title){
			$scope.title = "Response List";
			$scope.resList = true;
			$rootScope.isRejecting = false;
			$scope.responseContent = false;
		}



		// show the details of the clicked response
		$scope.clickRequest = function(obj){
			$scope.resList = false;
			$scope.responseContent = true;
			$scope.title = "Click here to go back to response list";
			$rootScope.isRejecting = false;
			$scope.selectedObj = obj;
		}
	}]);
};