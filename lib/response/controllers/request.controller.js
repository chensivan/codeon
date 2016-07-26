module.exports = function(app){

app.controller("RequestController", ['$timeout','$scope','$rootScope','QuestionManager','ResponseManager',function ($timeout, $scope,$rootScope,QuestionManager,ResponseManager) {

	$scope.iterationMsg="";

	var editorListener = atom.workspace.getActiveTextEditor()

	editorListener.onDidChange(function(e){
		QuestionManager.anyChanges();
	});

	$scope.openNewTabShowCodeDiff = function(answers){
		$scope.legend = true;
		ResponseManager.showCodeDiff(answers);
	}

	$scope.openNewTabShowHelperCode = function(answers){
		if(atom.workspace.getPanes().length>1){
			alert('Please first close helper current code');
		}else{
			ResponseManager.showHelperCode(answers);
		}
	}

	$scope.inlineCodeResponse = function(answer){
		ResponseManager.viewCodeDiff(answer, answer.showMerge);
		response.showMerge = response.showMerge=="Show code difference"?"Close it!"
											:"Show code difference";
	}

	$scope.runCurrentOpenTabCode = function(){
		ResponseManager.runOpenTabCode();
	}

	$scope.finalMergeVersion = function(answer){
		ResponseManager.mergeCode(answer);
	}

	$scope.showLocationWithinRequest = function(selectedObj){

		atom.workspace.open(selectedObj.changelog[1].path)
		.then(function(editor){
			_.every(selectedObj.changelog, function(obj){
				if(obj.type=='cursor'){
					editor.scrollToScreenPosition(obj.cursor,{center:true});
					editor.setCursorScreenPosition(obj.cursor);
					return false;
				}

				if(obj.type=='selection_range'){
					editor.scrollToScreenPosition(obj.range[0],{center:true});
					editor.setCursorScreenPosition(obj.range[0]);
					return false;
				}
				return true;
			});
		});
	}

	$scope.comments = [];
  $scope.txtcom = '';
  $scope.commenting = false;
  $scope.addComment = function(){
    $scope.commenting = true;
  }

  $scope.submitComment = function(msg){
		$scope.selectedObj.status.discussion.push({
  		sender: "Requester",
      timestamp: (new Date()).getTime(),
      value:msg
  	});
		$scope.txtcom = '';
    $scope.commenting = !$scope.commenting;

		$timeout(function(){
			QuestionManager.sendIterationRequest($scope.selectedObj.question_id, msg);
		},0,false);



  }

  $scope.cancelComment = function(){
    $scope.commenting = !$scope.commenting;
    $scope.txtcom = '';
  }

}]);


};




//********** old code ***********


// Annotation response
// $scope.annotationResponse = function(answer, helperAnswers){
// 	debugger;
//
// 	if(answer.showTip=='Close it'){
// 		ResponseManager.viewMyCurrentWorkingCode(answer);
// 		answer.showTip = 'Show me'
// 	}else{
//
// 		//loop through helperAnswers to see if there are any inline code in this editor
// 		helperAnswers.forEach(function(ans){
// 			if(ans.type=='inlinecode' && ans.editorID == answer.editorID){
// 				ResponseManager.viewHelperCode(ans);
// 			}
// 		});
//
// 		ResponseManager.viewAnnotation(answer,answer.showTip);
//
// 		answer.showTip = 'Close it'
// 	}
//
// }
//
// $scope.helperVersion = function(answer){
// 	// helperAnswers.forEach(function(ans){
// 	// 	if(ans.type=='inlinecode' && ans.editorID == answer.editorID){
// 	// 		ResponseManager.viewHelperCode(ans);
// 	// 	}
// 	// });
// 	//
// 	// ResponseManager.viewAnnotation(answer,answer.showTip);
//
// 	ResponseManager.viewHelperCode(answer);
// 	// ResponseManager.viewHelperMergeCode(answer);
// }
//
//
// 	//click 'accept answer'
// 	// $scope.merge = function(answer, request) {
// 	//
// 	// 	// answer.removeButton = true;
// 	// 	QuestionManager.markResolved(request.question_id);
// 	// 	//set text to merge version
// 	// 	ResponseManager.mergeCode();
// 	// };
//
//
//
// // send out the iteration message
// $scope.iterate = function(msg) {
// 	$scope.selectedObj.status.discussion.push({
// 		sender: "requester",
//     timestamp: (new Date()).getTime(),
//     value:msg
// 	})
// 	console.log(msg);
// 	QuestionManager.sendIterationRequest($scope.selectedObj.question_id, msg);
//
// 	$scope.iterationMsg = "";
//
// }
//
// $scope.githubVersion = function(answer){
// 	ResponseManager.viewCodeDiff(answer);
// }
//
//
// $scope.myCurrentCode = function(answer){
//
// 	ResponseManager.viewMyCurrentWorkingCode(answer);
// }
