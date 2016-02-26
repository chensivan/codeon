module.exports = function(app){

app.controller("ShowRequest", ['$scope','$rootScope','QuestionManager',function ($scope,$rootScope,QuestionManager) {
	$scope.nah = function(obj){
		$rootScope.isRejecting = !$rootScope.isRejecting;
	};

	$scope.replay = function(obj){
		//SANG: look at obj.status
		console.log(obj);
			atom.workspace.open();
			// need to access myArr[obj].livewriting_logs
			// set the enw tab with myArr[obj].livewriting_logs.initial_text

	};
	$scope.merge = function(msg) {
		QuestionManager.markResolved($scope.selectedObj.question_id);
	};

	// send out the iteration message
	$scope.iterate = function(msg) {
		QuestionManager.sendIterationRequest($scope.selectedObj.question_id, msg);

		$scope.inputs.iterationMsg = "";
		$rootScope.isRejecting = false;

/*
		$scope.$apply(function() {
			// $scope.myArr[key].status = "Status: Solved!";
				value.status = "Status: Unsolved!";
				angular.element(document.getElementById(response.id)).css('background-color','white')
		})
		*/

	}

	//show each sub-response within one response if there are some
	$scope.subResponseClick = function(response){
		editor = atom.workspace.getActiveTextEditor();

		if (response.type == "code"){
			/*
			editor.scrollToScreenPosition([2,0],{center:true})
			var marker = editor.markScreenPosition([2,0],{invalidate:'never'});
			editor.decorateMarker(marker, {type:'line', class:'delete'});
			var marker = editor.markScreenPosition([3,0],{invalidate:'never'});
			editor.decorateMarker(marker, {type:'line', class:'add'});
			*/



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


		if(response.type == "annotation"){
			var highlights = [[response.location.start.row,response.location.start.column],
				[response.location.end.row,response.location.end.column]];
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

		if(response.type == "Response Type: explanation"){
			//console.log(response.response);

		}

	}

}]);


};
