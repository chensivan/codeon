var tooltip = require('../tooltipMain');
var _ = require('underscore');
var RequestView = require('../../requests/requestView');

module.exports = function(app) {

	app.controller("ResponsePanelController", ['AlertMessageHandler','$scope','$rootScope','$timeout', 'QuestionManager','RequestReplayer',function (AlertMessageHandler,$scope,$rootScope,$timeout,QuestionManager,RequestReplayer) {

		$scope.title = "Codeon Requests";
		$scope.resList = true;
		$scope.responseContent = false;
		$scope.activated = false;
		$rootScope.requests = [];
		$scope.inputs = {
			requestID: "",
			iterationMsg: "",
			editedRequest: "",
			editedTitle: ""
		};

		$scope.toggle = function(response_index){
			$scope.selectedObj.status.responses[response_index].show = !$scope.selectedObj.status.responses[response_index].show;
			for (var i=0; i< $scope.selectedObj.status.responses.length; i++){
				if(i!=response_index){
					$scope.selectedObj.status.responses[i].show = false;
				}
			}
			// if($scope.selectedObj.activated)
			// 	$scope.selectedObj.status.responses[response_index].show = true;
		};


		// setTimeout($scope.newResponse, 2000);
		$scope.$on('codeon_response', function(response) {
	    //response range
			var range = response.range;


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
			$scope.activated = false;
		}

		// show the details of the clicked response
		$scope.clickRequest = function(obj){

			if(obj.status.state=='new' || obj.status.state=='new_comment'){
				QuestionManager.markWaitingForAction(obj.question_id);
				// obj.notification = "Waiting for actions";
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

		$scope.editTranscript = function(obj){
			debugger;
			QuestionManager.updateTranscript(obj.question_id, obj.transcript);
		}

		$scope.cancelRequest = function(obj){
			console.log(obj);
			obj.edit = false;
			$scope.inputs.editedRequest = "";
		}

		$scope.editTitle2 = function(){
			if($scope.selectedObj.title!=''){
				QuestionManager.updateTitle($scope.selectedObj.question_id, $scope.selectedObj.title);
			}
		}

		$scope.editTranscript2 = function(){
			debugger
			if($scope.selectedObj.transcript!=''){
				QuestionManager.updateTranscript($scope.selectedObj.question_id, $scope.selectedObj.transcript);
			}
		}

		$scope.editTitle = function(obj){
			obj.editTitle = true;
		}

		$scope.changeTitle = function(input, obj){
			obj.title = input;
			console.log(obj);
			// debugger;
			QuestionManager.updateTitle(obj.question_id, input);
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

		$scope.hidePanel = function(){

		}


	}]);
};
