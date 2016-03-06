var TooltipView = require('../../utils/tooltip-view');
var Range = require('atom').Range;
var _ = require('underscore');
var diff = require("node-diff3").diff;
var jsdiff = require("diff");
var marker = {};
var lineMarkers = {};
var mergeVersionOfCode = {};
$ = require("jquery");
var editorNum;

module.exports = function(app) {
	app.factory('ResponseManager', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

    var editorViewMappings = {};
  	var editor = {};
		var tooltipMarkers = [];

		function createMarker(response){
			editor = atom.workspace.getActiveTextEditor();
			marker.highlights = [[response.location.start.row,response.location.start.column],[response.location.end.row,response.location.end.column]];
			editor.scrollToScreenPosition(marker.highlights[0],{center:true})
		}

		function openToolTip(markerInfor){

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

    return rv = {
      viewAnnotation: function(response,toggle){


    		//open the desired file

    		//read the json file first

    		//access the change log

    		if(toggle =="Show me"){
					editorNum =0;
					createMarker(response);

					atom.workspace.observeTextEditors(function(editor){
						console.log(editor);
						editorNum++;
						markerDecoration();
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
					for(i=0;i<editorNum;i++){
						tooltipMarkers.forEach(function(mk){
							mk.destroy();
					  })
					}
    		}
    	},

      viewCodeDiff: function(response,toggle){
        editor = atom.workspace.getActiveTextEditor();
    		console.log(response);

    		if(toggle == "Show code difference"){

    			// get the current editor Content
    			lineMarkers.currentDev = editor.getText();

    			// get response content
    			lineMarkers.currentRes = response.response;

    			// get original code
    			lineMarkers.original = lineMarkers.currentDev;

    			//use diff merge to generate the merge version of the code
    			mergeVersionOfCode = diff.merge([lineMarkers.currentDev],[lineMarkers.original],[lineMarkers.currentRes]);
    			// console.log(mergeVersionOfCode);
    			// $scope.mergeVersionOfCode = mergeVersionOfCode;

    			// get this merge version up once click "merge" button

    			lineMarkers.codeDiff = jsdiff.diffLines(lineMarkers.currentDev, mergeVersionOfCode.result[0]);
    			// console.log(codeDiff);

    			var lastLine = editor.getLineCount()-1;

    			// run through codeDiff array and add bg color depending on the properties of each element
    			editor.setText("");
					lineMarkers.markers = [];
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

    			});
    		} else {
					console.log(lineMarkers.markers);
    			lineMarkers.markers.forEach(function(lineMarker){
          	lineMarker.destroy();
        	});
    			editor.setText(lineMarkers.currentDev);
    		}
      },
      mergeCode: function(){
        var editor = atom.workspace.getActiveTextEditor();
    		console.log(mergeVersionOfCode);
    		// debugger;
    		editor.setText(mergeVersionOfCode.result[0]);
      }
    };

  }]);
}
