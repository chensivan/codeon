module.exports = function(app){

app.controller("RequestController", ['$timeout','$scope','$rootScope','QuestionManager','ResponseManager',function ($timeout, $scope,$rootScope,QuestionManager,ResponseManager) {

	$scope.iterationMsg="";

	var editorListener = atom.workspace.getActiveTextEditor()

	//check if there are anything changed on requester code
	// editorListener.onDidChange(function(e){
	// 	QuestionManager.anyChanges();
	// });

	$scope.codeDiffButtonName = "Helper Code";

	$scope.openNewTabShowCodeDiff = function(answers){
		debugger;
		if ($scope.codeDiffButtonName == "Code Diff") {
			$scope.codeDiffButtonName = "Helper Code";
			$scope.codeDiffLegend = true;
			$scope.codeCommentLegend = false;
			ResponseManager.showCodeDiff(answers);
		}else {

			//if not only annotation,
			var onlyAnnotation = false;
			_.every(answers,function(val, ind){
				if(val.type=='inlinecode' && val.original == val.value){
					onlyAnnotation = true;
					return false
				}
				return true;
			});

			if(!onlyAnnotation){
				// $scope.mergedAlready = false;
				$scope.codeDiffButtonName = "Code Diff";
				$scope.noInlineCode = false;
			}else{
				$scope.noInlineCode = true;
			}

			$scope.codeDiffLegend = false;
			$scope.codeCommentLegend = true;
			ResponseManager.showHelperCode(answers);
		}
	}

	$rootScope.$on('directlyShowHelper',function(devent,data){
		$scope.codeDiffButtonName = "Helper Code";
		$scope.openNewTabShowCodeDiff(data);
	})

	$scope.openNewTabShowHelperCode = function(answers){
		$scope.codeDiffLegend = false;
		$scope.codeCommentLegend = true;
		ResponseManager.showHelperCode(answers);
	}

	$scope.inlineCodeResponse = function(answer){
		ResponseManager.viewCodeDiff(answer, answer.showMerge);
		response.showMerge = response.showMerge=="Show code difference"?"Close it!"
											:"Show code difference";
	}

	$scope.runCurrentOpenTabCode = function(){
		debugger;
		var a = atom.workspace.getActiveTextEditor().getText();
		eval(a);
		// ResponseManager.runOpenTabCode();
	}

	$scope.finalMergeVersion = function(answer){
		// $scope.mergedAlready = !$scope.mergedAlready;
		//show helper code only
		// helper and requester have same code
		debugger;

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
		if(msg !=''){
			$scope.commenting = !$scope.commenting;
			$timeout(function(){
				$scope.selectedObj.status.discussion.push({
		  		sender: "Requester",
		      timestamp: (new Date()).getTime(),
		      value:msg
		  	});
				$scope.txtcom = '';
			},0,false).then(function(){
				$timeout(function(){
					QuestionManager.sendIterationRequest($scope.selectedObj.question_id, msg);
				},0,false);
			})
    }
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
