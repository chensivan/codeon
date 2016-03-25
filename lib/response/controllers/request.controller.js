module.exports = function(app){

app.controller("RequestController", ['$scope','$rootScope','QuestionManager','ResponseManager',function ($scope,$rootScope,QuestionManager,ResponseManager) {

	$scope.iterationMsg="";
	// Annotation response
	$scope.annotationResponse = function(response){
		ResponseManager.viewAnnotation(response,response.showTip);
	}

	$scope.inlineCodeResponse = function(response){
		ResponseManager.viewCodeDiff(response, response.showMerge);
		response.showMerge = response.showMerge=="Show code difference"?"Close it!"
											:"Show code difference";
	}

	$scope.myVersion = function(response){
		ResponseManager.viewMyCode(response);
	}

	$scope.helperVersion = function(response){
		ResponseManager.viewHelperCode(response);
	}

	$scope.githubVersion = function(response){
		ResponseManager.viewCodeDiff(response);
	}



	$scope.merge = function(request) {

		request.removeButton = true;
		QuestionManager.markResolved($scope.selectedObj.question_id);
		//set text to merge version
		ResponseManager.mergeCode();
	};

	// send out the iteration message
	$scope.iterate = function(msg) {
		console.log(msg);
		QuestionManager.sendIterationRequest($scope.selectedObj.question_id, msg);

		$scope.iterationMsg = "";

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
