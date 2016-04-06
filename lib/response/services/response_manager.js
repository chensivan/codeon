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
		var version;

		function createMarker(answer){
			// console.log($rootScope.path);
			atom.workspace.open("/"+answer.path).then(function(ed){

				editor = ed;
				marker.highlights = new Range([
					answer.location.start.row,
					answer.location.start.column
				],[
					answer.location.end.row,
					answer.location.end.column
				]);

				editor.scrollToScreenPosition(marker.highlights.start,{center:true})

				atom.workspace.observeTextEditors(function(editor){
					editorNum++;
					markerDecoration();
					observeCursors(answer);
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
			if(markers!=null){
				markers.forEach(function(mk){
					mk.destroy();
				})
			}

		}

		function observeCursors(answer){
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
								text: answer.value,
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

		function observeTabs(answer){
			removeMarker(tooltipMarkers);
			editorNum = 0; //reset total number of open tabs

			createMarker(answer);
		}

		function removeText(){

		}

		function addCodeDiff(answer){

			atom.workspace.open("/"+answer.path).then(function(ed){
				editor = ed;

				if(!lineMarkers.hasOwnProperty('path')){
					lineMarkers.path = {};
				}

				//if resposne path is Not in the linemarker, set the value to be the current code
				if(!lineMarkers.path.hasOwnProperty(answer.path)){
					lineMarkers.path[answer.path] = editor.getText();
				}

				lineMarkers.currentDev = lineMarkers.path[answer.path];

				// get answer content
				lineMarkers.currentRes = answer.value;

				// get original code
				lineMarkers.original = answer.original;

				var currentDevArray = lineMarkers.currentDev.split("\n");
				var originalArray = lineMarkers.original.split("\n");
				var currentResArray = lineMarkers.currentRes.split("\n");

				mergeVersionOfCode = diff.merge(currentDevArray,originalArray,currentResArray);


				lineMarkers.codeDiff = jsdiff.diffJson(lineMarkers.currentDev, lineMarkers.currentRes ,{newlineIsToken:true});
				console.log(lineMarkers.codeDiff);
				setLineMarker();

				// if there is conflicts we only print out this var
				// if(mergeVersionOfCode.conflict){
				//
				// 	// editor.setText("");
				// 	// editor.insertText(mergeVersionOfCode.result.join('\n'));
				// 	// editor.scrollToScreenPosition([0,0],{center:true});
				//
				// 	var requesterVersionStartIndex = mergeVersionOfCode.result.indexOf('\n<<<<<<<<<\n');
				// 	var twoVersionSeperationIndex = mergeVersionOfCode.result.indexOf('\n=========\n')
				// 	var helperVersionEndIndex = mergeVersionOfCode.result.indexOf('\n>>>>>>>>>\n');
				// 	//
				// 	firstLineOfConflict = requesterVersionStartIndex;
				// 	var requesterCurrentVersionConflictEndIndex   = twoVersionSeperationIndex - 1;
				// 	//
				// 	var requesterVersion = mergeVersionOfCode.result.slice(requesterVersionStartIndex+1, twoVersionSeperationIndex);
				// 	var helperVersion = mergeVersionOfCode.result.slice(twoVersionSeperationIndex+1,helperVersionEndIndex);
				//
				// 	var twoVersionObject = {
				// 	    requester: requesterVersion,
				// 	    helper: helperVersion
				// 	}
				//
				// 	var mergeContainsTwoVersion = mergeVersionOfCode.result.slice(0, requesterVersionStartIndex).concat(twoVersionObject, mergeVersionOfCode.result.slice(helperVersionEndIndex+1))
				//
				// 	var mergeVersionToShow = mergeVersionOfCode.result.slice(0, requesterVersionStartIndex).concat(requesterVersion, mergeVersionOfCode.result.slice(helperVersionEndIndex+1))
				//
				// 	var mergeHelper = mergeVersionOfCode.result.slice(0, requesterVersionStartIndex).concat(twoVersionObject.helper, mergeVersionOfCode.result.slice(helperVersionEndIndex+1))
				//
				// 	var mergeMy = mergeVersionOfCode.result.slice(0, requesterVersionStartIndex).concat(twoVersionObject.requester, mergeVersionOfCode.result.slice(helperVersionEndIndex+1))
				// 	//
				// 	// var mergeContainsTwoVersion = mergeVersionOfCode.result.slice(0, requesterVersionStartIndex).concat(twoVersionObject, mergeVersionOfCode.result.slice(helperVersionEndIndex+1))
				// 	//
				// 	// var mergeVersionToShow = mergeVersionOfCode.result.slice(0, requesterVersionStartIndex).concat(requesterVersion, mergeVersionOfCode.result.slice(helperVersionEndIndex+1))
				// 	//
				// 	var mergeFirstPart  = mergeVersionOfCode.result.slice(0,requesterVersionStartIndex).join('\n')
				// 	var mergeSecondPart = mergeVersionOfCode.result.slice(helperVersionEndIndex+1).join('\n')
				//
				// 	var currentFirstPart  = currentDevArray.slice(0,requesterVersionStartIndex).join('\n')
				// 	var currentSecondPart = currentDevArray.slice(twoVersionSeperationIndex-1).join('\n')
				//
				// 	// mergeConflictCode = mergeVersionOfCode.result.slice(requesterVersionStartIndex,helperVersionEndIndex+1)
				//
				// 	mergeConflictCode = {
				// 	    value: mergeVersionOfCode.result.slice(requesterVersionStartIndex,helperVersionEndIndex+1).join('\n'),
				// 	    helper: twoVersionObject.helper.join('\n'),
				// 	    requester: twoVersionObject.requester.join('\n')
				// 	}
				//
				// 	// lineMarkers.codeDiff = jsdiff.diffJson(currentFirstPart, mergeFirstPart,{newlineIsToken:true}).concat(jsdiff.diffJson(currentSecondPart, mergeSecondPart,{newlineIsToken:true}))
				// 	lineMarkers.codeDiff = jsdiff.diffJson(currentFirstPart, mergeFirstPart,{newlineIsToken:true})
				// 							.concat(mergeConflictCode)
				// 							.concat(jsdiff.diffJson(currentSecondPart, mergeSecondPart,{newlineIsToken:true}))
				// 	debugger;
				// 	// console.log(lineMarkers.codeDiff);
				// 	setLineMarker();
				//
				// } else{
				// 	// get this merge version up once click "merge" button
				//
				// 	lineMarkers.codeDiff = jsdiff.diffJson(lineMarkers.currentDev, mergeVersionOfCode.result.join('\n'),{newlineIsToken:true});
				// 	console.log(lineMarkers.codeDiff);
				// 	setLineMarker();
				// }

			});
		}

		function setLineMarker(){
			// run through codeDiff array and add bg color depending on the properties of each element
			editor.setText("");
			var lastLine = 0;
			lineMarkers.markers = [];
			lineMarkers.deleteMarkers = [];
			var location = {};
			_.each(lineMarkers.codeDiff, function(line, index){

				var action = line.added ? 'add' : line.removed ? 'delete' : 'nothingchanged';

				//see github version, but we want to have helper version, and requester version
				var textThatNeedsToBeInserted = line.value;

				var temp;
				if(line.value=="\n"){
					temp = [""];
				}else {
					temp = line.value.split('\n');
				}

				if(temp.indexOf('<<<<<<<<<')>-1){
					if(version=='helpercode'){
						// temp = temp.slice(start+2, end-1);
						// textThatNeedsToBeInserted = temp.join('\n')
						textThatNeedsToBeInserted=line.helper

					}else if(version=='mycode'){
						// var start = temp.indexOf('=========');
						// var end = temp.indexOf('>>>>>>>>>');
						// temp = temp.slice(start+2, end-1);
						textThatNeedsToBeInserted = line.requester;
					}
				}

				editor.insertText(textThatNeedsToBeInserted);


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
					if(action == 'delete'){
						lineMarkers.deleteMarkers.push(range)
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

					if((temp[temp.length-1]!="")&&(index!=lineMarkers.codeDiff.length-1)&&((lineMarkers.codeDiff[index+1].value.split('\n')[0]!=""))){
						editor.insertText('\n')
					}

					if((temp[temp.length-1]=="")&&(temp.length==1)){
						editor.insertText('\n')
					}
	      }

	      // Update the last line for future diff framgments.
	      lastLine = editor.getLineCount();

				//see github version, but we want to have helper version, and requester version
				// if(lastLine == firstLineOfConflict){
				//
				// 	editor.insertText(mergeConflictCode.value)
				// 	lastLine = lastLine + mergeConflictCode.value.split('\n').length+5;
				// 	firstLineOfConflict = -1;
				// 	mergeConflictCode = [];
				// }

			});

			//first line of difference;
			editor.scrollToScreenPosition(location,{center:true})
		}

    return rv = {
      viewAnnotation: function(answer,toggle){
    		toggle == "Show me"?observeTabs(answer)
								: removeMarker(tooltipMarkers)
    	},
      viewCodeDiff: function(answer){
				removeMarker(tooltipMarkers);
				version = 'github';
				addCodeDiff(answer);
      },
			viewHelperMergeCode: function(answer){
				removeMarker(tooltipMarkers);
				version = 'helpercode';
				addCodeDiff(answer);
			},
			viewMyCode: function(answer){
				removeMarker(tooltipMarkers);
				removeMarkerForCodeDiff(lineMarkers.markers);
				version = 'mycode'
				addCodeDiff(answer)

				// if(!lineMarkers.hasOwnProperty('path')){
				// 	lineMarkers.path = {};
				// }
				// //if resposne path is Not in the linemarker, set the value to be the current code
				// if(!lineMarkers.path.hasOwnProperty(answer.path)){
				//
				// 	atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 		lineMarkers.path[answer.path] = mergeTab.getText();
				// 		 mergeTab.scrollToScreenPosition([0,0],{center:true})
				// 	});
				//
				// }else{ //if resposne path is in the linemarker path, load the value
				// 	atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 		mergeTab.setText("");
				// 		mergeTab.insertText(lineMarkers.path[answer.path]);
				// 		mergeTab.scrollToScreenPosition([0,0],{center:true})
				// 	});
				// }

				// if(!answer.mergeConflict){

				// }

				// atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 	mergeTab.setText("");
				// 	mergeTab.insertText(lineMarkers.currentDev);
				// });
				//
				//
				// if(lineMarkers.hasOwnProperty('path') && lineMarkers.path!=answer.path){
				// 	lineMarkers.path = answer.path;
				// 	atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 		lineMarkers.currentDev = mergeTab.getText();
				// 	});
				// }
				//
				// if(!lineMarkers.hasOwnProperty('currentDev')){
				// 	// simply open the file
				// 	atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 		lineMarkers.currentDev = mergeTab.getText();
				// 	});
				// }else{
				//
				// }

			},
			removeRequesterCurrentCodeInSystem: function(){
				lineMarkers.path = {};
			},
			viewMyCurrentWorkingCode:function(answer){
				removeMarker(tooltipMarkers);
				removeMarkerForCodeDiff(lineMarkers.markers);

				if(!lineMarkers.hasOwnProperty('path')){
					lineMarkers.path = {};
				}
				//if resposne path is Not in the linemarker, set the value to be the current code
				// if(!lineMarkers.path.hasOwnProperty(answer.path)){

				if(!lineMarkers.path.hasOwnProperty(answer.path)){
					atom.workspace.open("/"+answer.path).then(function(mergeTab){
						lineMarkers.path[answer.path] = mergeTab.getText();
						 mergeTab.scrollToScreenPosition([0,0],{center:true})
					});
				}else{ //if resposne path is in the linemarker path, load the value
					atom.workspace.open("/"+answer.path).then(function(mergeTab){
						mergeTab.setText("");
						mergeTab.insertText(lineMarkers.path[answer.path]);
						mergeTab.scrollToScreenPosition([0,0],{center:true})
					});
				}


				// }else{ //if resposne path is in the linemarker path, load the value
				// 	atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 		mergeTab.setText("");
				// 		mergeTab.insertText(lineMarkers.path[answer.path]);
				// 		mergeTab.scrollToScreenPosition([0,0],{center:true})
				// 	});
				// }

				// if(!answer.mergeConflict){

				// }

				// atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 	mergeTab.setText("");
				// 	mergeTab.insertText(lineMarkers.currentDev);
				// });
				//
				//
				// if(lineMarkers.hasOwnProperty('path') && lineMarkers.path!=answer.path){
				// 	lineMarkers.path = answer.path;
				// 	atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 		lineMarkers.currentDev = mergeTab.getText();
				// 	});
				// }
				//
				// if(!lineMarkers.hasOwnProperty('currentDev')){
				// 	// simply open the file
				// 	atom.workspace.open("/"+answer.path).then(function(mergeTab){
				// 		lineMarkers.currentDev = mergeTab.getText();
				// 	});
				// }else{
				//
				// }
			},
			viewHelperCode: function(answer){
				removeMarker(tooltipMarkers);
				if(!lineMarkers.hasOwnProperty('path')){
					lineMarkers.path = {};
				}

				atom.workspace.open("/"+answer.path).then(function(mergeTab){

					//if resposne path is Not in the linemarker, set the value to be the current code
					if(!lineMarkers.path.hasOwnProperty(answer.path)){
						lineMarkers.path[answer.path] = mergeTab.getText();
					}

					mergeTab.setText("");
					mergeTab.insertText(answer.value);
					mergeTab.scrollToScreenPosition([0,0],{center:true})

				});
			},
      mergeCode: function(){

				//run through the current tab and remove all the deletion line

				debugger;

				removeMarker(tooltipMarkers);
				removeMarkerForCodeDiff(lineMarkers.markers);
				editor = atom.workspace.getActiveTextEditor();

				_.each(lineMarkers.deleteMarkers, function(deletion){
					//each eletion is a range {start: {row:.., column:..}, end: {row:..,column:..}}
					editor.setSelectedScreenRange(deletion);
					editor.deleteLine();
				})
				//
				// _.each(editor.getDecorations(), function(decoration){
				// 	if(decoration.properties.class=='delete'){
				//
				// 	}
				// })
				//
				//
    		// if(mergeVersionOfCode.result[0]){
				// 	editor = atom.workspace.getActiveTextEditor();
	    	// 	editor.setText(mergeVersionOfCode.result[0]);
				// }
      }
    };

  }]);
}
