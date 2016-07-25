var tooltip = require('../tooltipMain');
var _ = require('underscore');
var RequestView = require('../../requests/requestView');
var Range = require('atom').Range;
var $ = require('jquery');

module.exports = function(app) {

	app.controller("ResponsePanelController", ['AlertMessageHandler','$scope','$rootScope','$timeout', 'QuestionManager','RequestReplayer','ResponseManager',function (AlertMessageHandler,$scope,$rootScope,$timeout,QuestionManager,RequestReplayer,ResponseManager) {

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

		atom.workspace.observeTextEditors(function(edi){
			edi.observeSelections(function(sel){

				sel.onDidChangeRange(function(){
					var EditorView = atom.views.getView(edi);

					EditorView.addEventListener('mouseup', function(event){
						//check selection
						var row = sel.getBufferRange().start.row;
						var rowDiff = sel.getBufferRange().end.row - sel.getBufferRange().start.row;
						var colDiff = sel.getBufferRange().end.column - sel.getBufferRange().start.column;
						var isWholeLine = ((rowDiff==1) && (colDiff==0));

						//check marker
						_.each(atom.workspace.getActiveTextEditor().getMarkers(), function(m){
							var markerRowDiff = m.getBufferRange().start.row - m.getBufferRange().end.row;
							var markerColDiff = m.getBufferRange().end.column -m.getBufferRange().start.column;
							var isMarkerOnSelection = (row == m.getBufferRange().start.row)
							//show up alert
							if ((markerRowDiff ==0) && (markerColDiff==0) && (isWholeLine) && (isMarkerOnSelection)){
								var question_id = m.getProperties().question_id;
								var request = {};
								//find the request that has this id
								_.every($rootScope.requests, function(existRequest){
									if(existRequest.question_id == question_id){
										request = existRequest;
										return false;
									}
									return true;
								});

								debugger;
								var sco = angular.element(document.getElementById('theList')).scope();

								sco.$apply(function(){
									sco.clickRequest(request);

								});
							}

						})

					});
				})
			});
		});

		$scope.toggle = function(response_index){

			$scope.selectedObj.status.responses[response_index].show = !$scope.selectedObj.status.responses[response_index].show;

			//close the rest response
			for (var i=0; i< $scope.selectedObj.status.responses.length; i++){
				if(i!=response_index){
					$scope.selectedObj.status.responses[i].show = false;
				}
			}
			ResponseManager.removeRequesterCurrentCodeInSystem();
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
			debugger;
			$scope.chatbox_open = true;
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

		$scope.showLocation = function(request){
			debugger;
			atom.workspace.open(request.changelog[1].path)
			.then(function(editor){
				var location = request.changelog[1].beginningSelection[0];

				editor.scrollToScreenPosition([location.start.row, location.start.end],{center:true});
				editor.setCursorScreenPosition([location.start.row, location.start.end]);
			});

		}

		$scope.comments = [];
    $scope.txtcom = '';
    $scope.commenting = false;
    $scope.addComment = function(){
      $scope.commenting = true;
    }

    $scope.submit = function(){
      $scope.commenting = !$scope.commenting;
      if($scope.txtcom !=''){
        var comObj = {
          "comt": $scope.txtcom,
          "time": new Date()
        }
        $scope.comments.push(comObj);
        $scope.txtcom = '';
        }
				console.log($scope.txtcom);
    }

    $scope.cancel = function(){
      $scope.commenting = !$scope.commenting;
      $scope.txtcom = '';
    }


	}]);
};
