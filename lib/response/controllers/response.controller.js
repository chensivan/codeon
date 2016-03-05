var TooltipView = require('./tooltip-view.js');
var Range = require('atom').Range;
var _ = require('underscore');
var diff = require("node-diff3").diff
var jsdiff = require("diff");
var marker = {};
$ = require("jquery");

module.exports = function(app){

app.controller("ShowRequest", ['$scope','$rootScope','QuestionManager',function ($scope,$rootScope,QuestionManager) {

	console.log("testing");
	$scope.showTips = "Show me";
	$scope.showMerge = "Show code difference";
	$scope.nah = function(obj){
		$rootScope.isRejecting = !$rootScope.isRejecting;
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

	// Annotation response
	var editorViewMappings = {};
	var editor = editor;
	$scope.annotationResponse = function(response){
		editor = atom.workspace.getActiveTextEditor();

		marker.highlights = [[response.location.start.row,response.location.start.column],[response.location.end.row,response.location.end.column]];

		var editor;
		if($scope.showTips=="Show me"){
			$scope.showTips = "Close it!"
			editor.scrollToScreenPosition(marker.highlights[0],{center:true})

			atom.workspace.observeTextEditors(function(editor){

				editorViewMappings[editor] = new TooltipView();

				editor._tooltipMarkers = [];
				// Decorate example ranges
				marker.marker = editor.markBufferRange(marker.highlights);

				marker.selection = editor.addSelectionForBufferRange(marker.marker.getBufferRange());
				marker.decoration = editor.decorateMarker(marker.marker, {
					class: 'test-pkg-highlight',
					type: 'highlight',
				});

				// console.log(marker);
				// marker.destroy();
				editor._tooltipMarkers.push(marker.marker);
				editor.observeCursors(function(cursor) {
					cursor.onDidChangePosition(function(e) {
						// Get cursor position.
						marker.cursor = cursor;
						var cursorPosition = e.newScreenPosition;
						var intersectionRange;
						var selectedMarker;

						// Check each marker to see if the cursor position intersects. Return first intersection.
						editor._tooltipMarkers.some(function(testMarker){

							var markerRange = testMarker.getScreenRange();
							if(markerRange.containsPoint(cursorPosition)) {
								intersectionRange = markerRange;
								selectedMarker = testMarker;

								return true;
							}
						});
						if (!marker.marker.isDestroyed()){
							if(intersectionRange && selectedMarker ) {
								// Open a tooltip at the cursor if there was an intersection.
								var EditorView = atom.views.getView(editor);
								if(!EditorView) return;

								var EditorElement = EditorView.shadowRoot | EditorView;

								editorViewMappings[editor].setParams({
									text: 'This is a dependency that you need to add',
									title: 'TEXT TITLE',
								});

								editorViewMappings[editor].open();

							} else {
								editorViewMappings[editor].close();
							}
						}


					});
				});

			});

			editor.setCursorScreenPosition(marker.highlights[0])
		} else {
			$scope.showTips = "Show me";
		  editorViewMappings = {}

			marker.marker.destroy();
			marker.selection.cursor.destroy();
			marker.decoration.destroy();
			// // marker.selection.marker.destroy();
			// // marker.selection.clear();
			marker.selection.marker.destroy();
			marker.selection.clear();

		}

	}

	$scope.inlineCodeResponse = function(response){
		editor = atom.workspace.getActiveTextEditor();
		console.log(response);

		if($scope.showMerge == "Show code difference"){
			$scope.showMerge = "Close it!";
		} else {
			$scope.showMerge = "Show code difference";
		}

		//open a new window
		// atom.workspace.open("codeDiff");
		// var diffEditor = atom.workspace.getActiveTextEditor();

		// get the current editor Content
		var currentDev = editor.getText();

		// get response content
		var currentRes = response.response;

		// get original code
		var original = currentDev;

		//use diff merge to generate the merge version of the code
		var merge = diff.merge([currentDev],[original],[currentRes]);
		console.log(merge);

		// get this merge version up once click "merge" button

		var codeDiff = jsdiff.diffLines(currentDev, merge.result[0]);
		console.log(codeDiff);

		// run through codeDiff array and add bg color depending on the properties of each element
		editor.setText("");
		_.each(codeDiff, function(line, index){
			var action = line.added ? "add" : line.removed ? "remove" : "original";
			console.log(line);
			editor.insertText(line.value);

			// var marker = diffEditor.markScreenPosition([index,0]);
			//
			// editor.decorateMarker(marker, {type:'line', class:color});

			//
			// var marker = editor.markScreenPosition([index,0],{invalidate:'never'});
			//
			//
			// editor.decorateMarker(marker, {type:'line', class:color});

		})

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
