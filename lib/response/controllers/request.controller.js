var TooltipView = require('./tooltip-view.js');
var Range = require('atom').Range;
var _ = require('underscore');
var diff = require("node-diff3").diff;
var jsdiff = require("diff");
var marker = {};
var lineMarkers = {
	markers:[]
};
$ = require("jquery");
// var textEditorDiff = require("./text-editor-diff");

module.exports = function(app){

app.controller("RequestController", ['$scope','$rootScope','QuestionManager',function ($scope,$rootScope,QuestionManager) {

	$scope.showTips = "Show me";
	$scope.showMerge = "Show code difference";

	// Annotation response
	var editorViewMappings = {};
	var editor;
	$scope.annotationResponse = function(response){
		editor = atom.workspace.getActiveTextEditor();
		console.log(editor);
		marker.highlights = [[response.location.start.row,response.location.start.column],[response.location.end.row,response.location.end.column]];
		console.log(marker.highlights);

		if($scope.showTips=="Show me"){
			$scope.showTips = "Close it!"
			editor.scrollToScreenPosition(marker.highlights[0],{center:true})

			atom.workspace.observeTextEditors(function(editor){

				editorViewMappings[editor] = new TooltipView();
				editor._tooltipMarkers = [];
				// Decorate example ranges
				marker.marker = editor.markBufferRange(marker.highlights,{
					invalidate: 'touch',
				});

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
									text: response.response,
									title: 'Comments from helper:',
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

			editor.decorateMarker(marker.marker, {
				class: 'original',
				type: 'highlight',
			});

			marker.marker.destroy();
			
		}

	}

	$scope.inlineCodeResponse = function(response){
		editor = atom.workspace.getActiveTextEditor();
		console.log(response);

		if($scope.showMerge == "Show code difference"){
			$scope.showMerge = "Close it!";

			// get the current editor Content
			lineMarkers.currentDev = editor.getText();

			// get response content
			lineMarkers.currentRes = response.response;

			// get original code
			lineMarkers.original = lineMarkers.currentDev;

			//use diff merge to generate the merge version of the code
			var mergeVersionOfCode = diff.merge([lineMarkers.currentDev],[lineMarkers.original],[lineMarkers.currentRes]);
			console.log(mergeVersionOfCode);
			$scope.mergeVersionOfCode = mergeVersionOfCode;

			// get this merge version up once click "merge" button

			lineMarkers.codeDiff = jsdiff.diffLines(lineMarkers.currentDev, mergeVersionOfCode.result[0]);
			// console.log(codeDiff);

			var lastLine = editor.getLineCount()-1;

			// run through codeDiff array and add bg color depending on the properties of each element
			editor.setText("");

			_.each(lineMarkers.codeDiff, function(line, index){

				var action = line.added ? 'add' : line.removed ? 'delete' : 'nothingchanged';
				editor.insertText(line.value);
				// Get the new last line position, adjusted for the end of the previous line.
				var currentLastLine = editor.getLineCount()-2;

				if(action !== 'nothingchanged') {
	        // Create the lineMarker range.
	        var range = new Range([lastLine, 0], [currentLastLine, 1]);
	        // Create the lineMarker.
	        var lineMarker = editor.markBufferRange(range, {
	          invalidate: 'inside',
	        });
	        // Decorate the lineMarker.
	        editor.decorateMarker(lineMarker, {type: 'line', class: action});

	        // Add the lineMarker to our lineMarkers list.
	        lineMarkers.markers.push(lineMarker);
	      }

	      // Update the last line for future diff framgments.
	      lastLine = currentLastLine+1;
				// var marker = editor.markScreenPosition([index,0]);
				// editor.decorateMarker(marker, {type:'line', class: action}); //classes define in tooltip.less

				//
				// editor.decorateMarker(marker, {type:'line', class:color});

			});
		} else {
			$scope.showMerge = "Show code difference";
			lineMarkers.markers.forEach(function(lineMarker){
      	lineMarker.destroy();
    	});

			editor.setText(lineMarkers.currentDev);

		}

	}

	$scope.merge = function(msg) {
		QuestionManager.markResolved($scope.selectedObj.question_id);

		//set text to merge version
		var editor = atom.workspace.getActiveTextEditor();
		console.log($scope.mergeVersionOfCode);
		// debugger;
		editor.setText($scope.mergeVersionOfCode.result[0]);
	};

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
