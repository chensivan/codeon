var TooltipView = require('./tooltip-view.js');
var Range = require('atom').Range;
var _ = require('underscore')
var marker = {};

module.exports = function(app){

app.controller("ShowRequest", ['$scope','$rootScope','QuestionManager',function ($scope,$rootScope,QuestionManager) {

	console.log("testing");
	$scope.showTips = "Show me";
	$scope.showTips = "Show code difference";
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
		console.log(response.response[0].location.start.row);

		editor = atom.workspace.getActiveTextEditor();

		_.each(response.response,function(responseObj){

			// Annotation response
			if(responseObj.type == "annotation"){

				marker.highlights = [[responseObj.location.start.row,responseObj.location.start.column],[responseObj.location.end.row,responseObj.location.end.column]];
				var editorViewMappings = {};


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
			          console.log(e);
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

			          if(intersectionRange && selectedMarker) {
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


			        });
			      });

					});
					editor.setCursorScreenPosition(marker.highlights[0])
				} else{
					$scope.showTips = "Show me";
					// updateDecoration(marker.decoration, )


					console.log(marker);
					marker.marker.destroy();
					marker.selection.cursor.destroy();
		      marker.decoration.destroy();
		      // marker.selection.marker.destroy();
		      // marker.selection.clear();
					marker.selection.marker.destroy();
 					marker.selection.clear();

					// marker.destroy();
					console.log(marker);


			  }
			}

			// Code inline response
			if(responseObj.type == "inlinecode"){
				$scope.showTips = "Close it!";
			}else {
				$scope.showTips = "Show code difference";
			}

		})
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
		// 	// //use diff merge
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
