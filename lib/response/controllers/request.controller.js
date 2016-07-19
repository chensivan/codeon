module.exports = function(app){

app.controller("RequestController", ['$scope','$rootScope','QuestionManager','ResponseManager',function ($scope,$rootScope,QuestionManager,ResponseManager) {

	$scope.iterationMsg="";

	var editorListener = atom.workspace.getActiveTextEditor()
	editorListener.onDidChange(function(e){
		QuestionManager.anyChanges();
	});

	// Annotation response
	$scope.annotationResponse = function(answer, helperAnswers){
		debugger;

		if(answer.showTip=='Close it'){
			ResponseManager.viewMyCurrentWorkingCode(answer);
			answer.showTip = 'Show me'
		}else{

			//loop through helperAnswers to see if there are any inline code in this editor
			helperAnswers.forEach(function(ans){
				if(ans.type=='inlinecode' && ans.editorID == answer.editorID){
					ResponseManager.viewHelperCode(ans);
				}
			});

			ResponseManager.viewAnnotation(answer,answer.showTip);

			answer.showTip = 'Close it'
		}

	}

	$scope.openNewTabShowHelperCode = function(answers){
		ResponseManager.showHelperCode(answers);
	}

	$scope.inlineCodeResponse = function(answer){
		ResponseManager.viewCodeDiff(answer, answer.showMerge);
		response.showMerge = response.showMerge=="Show code difference"?"Close it!"
											:"Show code difference";
	}

	$scope.finalMergeVersion = function(answer){
		ResponseManager.mergeCode(answer);
	}

	$scope.helperVersion = function(answer){
		// helperAnswers.forEach(function(ans){
		// 	if(ans.type=='inlinecode' && ans.editorID == answer.editorID){
		// 		ResponseManager.viewHelperCode(ans);
		// 	}
		// });
		//
		// ResponseManager.viewAnnotation(answer,answer.showTip);

		ResponseManager.viewHelperCode(answer);
		// ResponseManager.viewHelperMergeCode(answer);
	}

	$scope.githubVersion = function(answer){
		ResponseManager.viewCodeDiff(answer);
	}

	$scope.myCurrentCode = function(answer){

		ResponseManager.viewMyCurrentWorkingCode(answer);
	}

	//click 'accept answer'
	// $scope.merge = function(answer, request) {
	//
	// 	// answer.removeButton = true;
	// 	QuestionManager.markResolved(request.question_id);
	// 	//set text to merge version
	// 	ResponseManager.mergeCode();
	// };

	// send out the iteration message
	$scope.iterate = function(msg) {
		$scope.selectedObj.status.discussion.push({
			sender: "requester",
      timestamp: (new Date()).getTime(),
      value:msg
		})
		console.log(msg);
		QuestionManager.sendIterationRequest($scope.selectedObj.question_id, msg);

		$scope.iterationMsg = "";

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

	//show each sub-response within one response if there are some
	$scope.subResponseClick = function(response){

		//
		// if (response.type == "code"){
		// 	/*
		// 	editor.scrollToScreenPosition([2,0],{center:true})
		// 	var marker = editor.markScreenPosition([2,0],{invalidate:'never'});
		// 	editor.decorateMarker(marker, {type:'line', class:'delete'});
		// 	var marker = editor.markScreenPosition([3,0],{invalidate:'never'});
		// 	editor.decorateMarker(marker, {type:'line', class:'add'});
		// 	*/
		//
		//
		//
		// 	// get the current editor Content
		// 	// var currentDev = editor.getText();
		// 	// var currentRes = response.response;
		// 	// var original = currentDev;
		// 	//
		// 	//
		// 	// var merge = diff.merge([original],[currentDev],[currentRes])
		// 	//
		// 	// var codeDiff = jsdiff.diffLines(currentDev,merge.result[0]);
		// 	//
		// 	// //empty editor
		// 	// editor.setText("")
		// 	//
		// 	//
		// 	// //start writing the code diff
		// 	// codeDiff.forEach(function(part,index){
		// 	// 	var color = part.added ? 'add': part.removed? 'delete':'nothingchanged';
		// 	// 	// debugger;
		// 	// 	//write this line
		// 	// 	editor.insertText(part.value)
		// 	// 	editor = atom.workspace.getActiveTextEditor();
		// 	//
		// 	// 	var marker = editor.markScreenPosition([index,0],{invalidate:'never'});
		// 	//
		// 	// 	editor.decorateMarker(marker, {type:'line', class:color});
		// 	//
		// 	// 	//
		// 	// 	// var marker = editor.markScreenPosition([index,0],{invalidate:'never'});
		// 	// 	//
		// 	// 	//
		// 	// 	// editor.decorateMarker(marker, {type:'line', class:color});
		// 	//
		// 	//
		// 	// 	//change the line color
		// 	//
		// 	// });
		// 	//
		// 	//
		// 	// console.log(codeDiff);
		// 	// console.log(merge.result[0]);
		// 	// // editor.setText(merge.result[0]);
		// 	// //use diff to find difference
		// 	//
		// 	// //editor.setSelectedBufferRange([[2,2],[4,4]]);
		//
		// 	console.log(response.location);
		// }





				/*


		editor.setSelectedBufferRange([[87,43],[87,52]]);
		editor.scrollToScreenPosition([87,43],{center:true})
		editor.setCursorScreenPosition([87,45])
		*/

			//
			// editor.setSelectedBufferRange(highlights);
			// editor.scrollToScreenPosition(highlights[0],{center:true})
			// editor.setCursorScreenPosition(highlights[1][1])

			//tooltip.initialize();

		}

}]);


};
