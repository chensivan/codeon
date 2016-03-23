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
		var mergeConflictCode = [];
		var firstLineOfConflict;

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
				invalidate: 'never',
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

		function removeMarkerForCodeDiff(markers){
			markers.forEach(function(mk){
				mk.destroy();
			})
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


				// _.each
				//use diff merge to generate the merge version of the code
				mergeVersionOfCode = diff.merge(currentDevArray,originalArray,currentResArray);
				//use diff merge to generate the merge version of the code
				// mergeVersionOfCode = diff.merge([lineMarkers.currentDev],[lineMarkers.original],[lineMarkers.currentRes]);
				// console.log(mergeVersionOfCode);
				// if there is conflicts we only print out this var

				if(mergeVersionOfCode.conflict){

					response.mergeConflict = true;

					var requesterVersionStartIndex = mergeVersionOfCode.result.indexOf('\n<<<<<<<<<\n');
					var twoVersionSeperationIndex = mergeVersionOfCode.result.indexOf('\n=========\n')
					var helperVersionEndIndex = mergeVersionOfCode.result.indexOf('\n>>>>>>>>>\n');

					firstLineOfConflict = requesterVersionStartIndex;
					var requesterCurrentVersionConflictStartIndex = requesterVersionStartIndex;
					var requesterCurrentVersionConflictEndIndex   = twoVersionSeperationIndex - 2;

					var requesterVersion = mergeVersionOfCode.result.slice(requesterVersionStartIndex+1, twoVersionSeperationIndex);
					var helperVersion = mergeVersionOfCode.result.slice(twoVersionSeperationIndex+1,helperVersionEndIndex);

					var twoVersionObject = {
						requester: requesterVersion,
						helper: helperVersion
					}

					var mergeContainsTwoVersion = mergeVersionOfCode.result.slice(0, requesterVersionStartIndex).concat(twoVersionObject, mergeVersionOfCode.result.slice(helperVersionEndIndex+1))

					var mergeVersionToShow = mergeVersionOfCode.result.slice(0, requesterVersionStartIndex).concat(requesterVersion, mergeVersionOfCode.result.slice(helperVersionEndIndex+1))

					var mergeFirstPart  = mergeVersionOfCode.result.slice(0,requesterVersionStartIndex).join('\n')
					var mergeSecondPart = mergeVersionOfCode.result.slice(helperVersionEndIndex+1).join('\n')

					var currentFirstPart  = currentDevArray.slice(0,requesterCurrentVersionConflictStartIndex).join('\n')
					var currentSecondPart = currentDevArray.slice(requesterCurrentVersionConflictEndIndex+1).join('\n')

					mergeConflictCode = mergeVersionOfCode.result.slice(requesterVersionStartIndex,helperVersionEndIndex+1)

					lineMarkers.codeDiff = jsdiff.diffJson(currentFirstPart, mergeFirstPart,{newlineIsToken:true}).concat(jsdiff.diffJson(currentSecondPart, mergeSecondPart,{newlineIsToken:true}))


					// console.log(lineMarkers.codeDiff);
					setLineMarker();

					// atom.workspace.open("/"+response.path).then(function(mergeTab){
					// 	mergeTab.setText("");
					// 	mergeTab.insertText(mergeVersionOfCode.result.join('\n'));
					// });

				}else{
					// get this merge version up once click "merge" button

					lineMarkers.codeDiff = jsdiff.diffJson(lineMarkers.currentDev, mergeVersionOfCode.result.join('\n'),{newlineIsToken:true});
					console.log(lineMarkers.codeDiff);
					setLineMarker();
				}

			});
		}

		function addMergeConflictCodeDiff(conflictArray){

		}

		function setLineMarker(){

			var lastLine = editor.getLineCount()-1;

			// run through codeDiff array and add bg color depending on the properties of each element
			editor.setText("");
			lineMarkers.markers = [];
			var location = {};
			_.each(lineMarkers.codeDiff, function(line, index){

				var action = line.added ? 'add' : line.removed ? 'delete' : 'nothingchanged';

				editor.insertText(line.value);
				var temp = line.value.split('\n');
				// Get the new last line position, adjusted for the end of the previous line.
				var currentLastLine = editor.getLineCount()-1;

				if(action !== 'nothingchanged') {
	        // Create the lineMarker range.
					// add color always after \n token
					var range;
					if(temp[0]==""){
						range = new Range([lastLine, 0], [currentLastLine, 100]);
					}else{
						range = new Range([lastLine-1, 0], [currentLastLine, 100]);
					}

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

				if(lastLine == firstLineOfConflict){
					editor.insertText(mergeConflictCode.join('\n'))
					lastLine = lastLine + mergeConflictCode.length+5;
				}

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
    		if(toggle == "Show code difference"){
					addCodeDiff(response)
				}
				else {
					if(response.mergeConflict){
						removeMarkerForCodeDiff(lineMarkers.markers);
						editor.setText(lineMarkers.currentDev);
					}
					else{

						removeMarkerForCodeDiff(lineMarkers.markers);
						editor.setText(lineMarkers.currentDev);
					}

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
