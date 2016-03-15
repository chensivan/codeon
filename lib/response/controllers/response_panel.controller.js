var tooltip = require('../tooltipMain');
var _ = require('underscore');
var RequestView = require('../../requests/requestView');

module.exports = function(app) {
	app.controller("ResponsePanelController", ['AlertMessageHandler','$scope','$rootScope','$timeout', 'QuestionManager','RequestReplayer',function (AlertMessageHandler,$scope,$rootScope,$timeout,QuestionManager,RequestReplayer) {

		$scope.title = "Codeon Requests";
		$scope.resList = true;
		$scope.responseContent = false;

		$rootScope.requests = [];
		$scope.inputs = {
			requestID: "",
			iterationMsg: "",
			editedRequest: "",
			editedTitle: ""
		};

		// setTimeout($scope.newResponse, 2000);
		$scope.$on('codeon_response', function(response) {
	    //response range
			var range = response.range;
			//
			// $scope.myArr.forEach(function(value,key){
			//
			// 	if(value.id == response.id){
			//
			// 		//change the color and status of the request
			// 		$scope.$apply(function (){
			// 			// $scope.myArr[key].status = "Status: Solved!";
			// 			value['response'] = new Array();
			//
			// 			value.status = "Status: Solved!";
			// 			//loop through response for multipel responses
			//
			//
			// 			response['response'].forEach(function(val){
			// 				value['response'].push(val);
			// 			});
			// 			// value['response'].push(response['response'])
			//
			//
			// 			console.log($scope.myArr);
			// 			//change panel background color to indicate the new response
			// 			angular.element(document.getElementById(response.id)).css('background-color','green')
			// 		})
			// 	}
			//
			// })

			atom.notifications.addSuccess("You received one response for this question:\n "+
																		"Can you debug this function for me. \n");
																		// 	"the response is: "+response.responseContent
		});

		$scope.bgColor = 'black';

		$scope.titleClick = function(title){
			$scope.title = "Codeon Requests";
			$scope.resList = true;
			$rootScope.isRejecting = false;
			$scope.responseContent = false;
		}

		// show the details of the clicked response
		$scope.clickRequest = function(obj){
			console.log(obj);
			if(obj.status.state=='new'){
				obj.notification = "Waiting for actions";
			}

			$scope.resList = false;
			$scope.responseContent = true;
			$scope.title = "Requests";
			$rootScope.isRejecting = false;
			$scope.selectedObj = obj;
		}

		$scope.hideRequest = function(request){
			console.log(((request.remove) && (request.status.state!=="resolved")))
			request.removeButton = false
			request.remove = true;
		}

		$scope.newRequest = function(){
			//call codeon function
			atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-codeon:toggle-recording')
		}

		$scope.editRequest = function(obj){
			obj.edit = true;
		}

		$scope.changeRequest = function(input, obj){
			obj.transcript = input;
			//send updates to the server
			QuestionManager.updateTranscript(obj.question_id, input);
			// debugger;
			obj.edit = false;
			$scope.inputs.editedRequest = "";

		}

		$scope.cancelRequest = function(obj){
			console.log(obj);
			obj.edit = false;
			$scope.inputs.editedRequest = "";
		}

		$scope.editTitle = function(obj){
			obj.editTitle = true;
		}

		$scope.changeTitle = function(input, obj){
			obj.title = input;
			// QuestionManager.updateTitle(obj.question_id, input);
			obj.editTitle = false;
			$scope.inputs.editedTitle = "";
		}

		$scope.cancelTitle = function(obj){
			console.log(obj);
			obj.editTitle = false;
			$scope.inputs.editedTitle = "";
		}

		var playControls;

		$scope.playRequest = function(obj){

			if(obj.playing) {
          obj.playing = false;
          if(playControls) {
              playControls.stop();
          }
      } else {
          obj.playing = true;
          playControls = RequestReplayer.playRequest(obj, function() {
              obj.playing = false;
          });
      }
		}


	}]);
};
