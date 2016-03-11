var TooltipView = require('../../utils/tooltip-view');
var Range = require('atom').Range;
var client = require('socket.io-client');
var prefs = require('../../utils/user_preferences');
var _ = require('underscore');
var diff = require("node-diff3").diff;
var jsdiff = require("diff");
var marker = {};
var lineMarkers = {};
var mergeVersionOfCode = {};
$ = require("jquery");
var editorNum;

module.exports = function(app) {
	app.factory('ResponseManager', ['$http', '$q', '$rootScope','QuestionManager', function ($http, $q, $rootScope,$QuestionManager) {

    var editorViewMappings = {};
  	var editor = {};
		var tooltipMarkers = [];

		function createMarker(response){
			// console.log($rootScope.path);
			atom.workspace.open("/"+response.path).then(function(ed){

				editor = ed;
				marker.highlights = new Range([
					response.location.start.row,
					response.location.start.column
				],[
					response.location.end.row,
					response.location.end.column
				]);

				editor.scrollToScreenPosition(marker.highlights.start,{center:true})

				atom.workspace.observeTextEditors(function(editor){
					editorNum++;
					markerDecoration();
					observeCursors(response);
				});
				editor.setCursorScreenPosition(marker.highlights.start)

			})
			// return ed;

		}

		function markerDecoration(){
			editorViewMappings[editor] = new TooltipView();

			// Decorate example ranges
			marker.marker = editor.markBufferRange(marker.highlights,{
				invalidate: 'touch',
			});

			marker.selection = editor.addSelectionForBufferRange(marker.marker.getBufferRange());
			marker.decoration = editor.decorateMarker(marker.marker, {
				class: 'test-pkg-highlight',
				type: 'highlight',
			});

			tooltipMarkers.push(marker.marker);
		}

		//need to fix this function
		function removeMarker(markers){
			for(i=0;i<editorNum;i++){
				markers.forEach(function(mk){
					mk.destroy();
			  })
			}
		}

		function observeCursors(response){
			editor.observeCursors(function(cursor) {
				cursor.onDidChangePosition(function(e) {
					// Get cursor position.
					marker.cursor = cursor;
					var cursorPosition = e.newScreenPosition;
					var intersectionRange;
					var selectedMarker;

					// Check each marker to see if the cursor position intersects. Return first intersection.
					tooltipMarkers.some(function(testMarker){
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
								marker: tooltipMarkers
							});

							editorViewMappings[editor].open();

						} else {

							editorViewMappings[editor].close();
						}
					}

				});
			});

		}

		function observeTabs(response){
			editorNum = 0; //reset total number of open tabs
			createMarker(response);
		}

		function addCodeDiff(response){

			atom.workspace.open("/"+response.path).then(function(ed){
				console.log("/"+response.path);
				editor = ed;
				// get the current editor Content
				lineMarkers.currentDev = editor.getText();

				// get response content
				lineMarkers.currentRes = response.response;

				// get original code
				lineMarkers.original = response.original;

				var currentDevArray = lineMarkers.currentDev.split("\n");
				var originalArray = lineMarkers.original.split("\n");
				var currentResArray = lineMarkers.currentRes.split("\n");

				_.each(currentDevArray,function(value,index){
					// debugger;
					if(value!=""){
						 currentDevArray[index] += "\n";
					}else {
						 currentDevArray[index-1] += "\n";
						 //check how many \n after
						//  var checkNewLine(currentDevArray,index)
					}
				});

				_.each(originalArray,function(value,index){
					// debugger;
					if(value!=""){
						 originalArray[index] += "\n";
					}else {
						 originalArray[index-1] += "\n";
						 //check how many \n after
						//  var checkNewLine(currentDevArray,index)
					}
				});

				_.each(currentResArray,function(value,index){
					// debugger;
					if(value!=""){
						 currentResArray[index] += "\n";
					}else {
						 currentResArray[index-1] += "\n";
						 //check how many \n after
						//  var checkNewLine(currentDevArray,index)
					}
				});

				//if there is no merge conflict: we are done

				//if there are merge conflict, we first convert 3 file into arrays
				//then we get the 3-way merge object using diff.merge
				//then we detect the last >>>>> 

				// _.each
				debugger;
				//use diff merge to generate the merge version of the code
				mergeVersionOfCode = diff.merge(currentDevArray,originalArray,currentResArray);
				console.log(mergeVersionOfCode);
				// if there is conflicts we only print out this var

				if(mergeVersionOfCode.conflict){
					response.mergeConflict = true;
					atom.workspace.open().then(function(mergeTab){
						_.each(mergeVersionOfCode.result,function(line){
							debugger;
							console.log(line);
							mergeTab.insertText(line,{autoIndentNewline:true});
						});
					});

				}else{
					// get this merge version up once click "merge" button

					lineMarkers.codeDiff = jsdiff.diffLines(lineMarkers.currentDev, mergeVersionOfCode.result[0]);
					console.log(lineMarkers.codeDiff);
					setLineMarker();
				}

			});
		}

		// function checkNewLine(arr, index){
		// 	if(arr[index+1])
		//
		// }

		function setLineMarker(){

			var lastLine = editor.getLineCount()-1;

			// run through codeDiff array and add bg color depending on the properties of each element
			editor.setText("");
			lineMarkers.markers = [];
			var location = {};
			_.each(lineMarkers.codeDiff, function(line, index){

				var action = line.added ? 'add' : line.removed ? 'delete' : 'nothingchanged';

				editor.insertText(line.value);
				// Get the new last line position, adjusted for the end of the previous line.
				var currentLastLine = editor.getLineCount()-2;

				if(action !== 'nothingchanged') {
	        // Create the lineMarker range.
	        var range = new Range([lastLine, 0], [currentLastLine, 1]);
					location = range.start;
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
			});

			//first line of difference;
			editor.scrollToScreenPosition(location,{center:true})
		}

    return rv = {
      viewAnnotation: function(response,toggle){
    		toggle == "Show me"?observeTabs(response)
								: removeMarker(tooltipMarkers)
    	},
      viewCodeDiff: function(response,toggle){
    		if(toggle == "Show code difference")
					addCodeDiff(response)
				else {
					removeMarker(lineMarkers.markers);
					editor.setText(lineMarkers.currentDev);
				}
      },
      mergeCode: function(){
    		if(mergeVersionOfCode.result[0]){
					editor = atom.workspace.getActiveTextEditor();
	    		editor.setText(mergeVersionOfCode.result[0]);
				}
      }
    };

  }]);
}
