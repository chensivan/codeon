var merge

module.exports = function(app){

app.controller("HelperResponse", ['Slider', '$scope','$rootScope', 'QuestionManager',function (Slider, $scope,$rootScope,QuestionManager) {
	$scope.hasReplay = false;
	$scope.active = false;

	var response = $scope.helper_response.response;
	$scope.response_hash_key = $scope.helper_response.$$hashKey.replace(/\D/g,'');
	// create a key for slider;
	//do something with response here and set $scope.hasReplay

	//console.log($scope.helper_response);

	response.forEach(function(item){
		if(item.type == "livewriting_logs"){
			$scope.hasReplay = true;
			$scope.response_hash_key == response.hash
		}
	});

	$scope.sliderInit = false;

	atom.workspace.onDidStopChangingActivePaneItem(function(){
		$scope.$evalAsync();
	});

	$scope.showSlider = function(slider_id){
		var editor = atom.workspace.getActiveTextEditor();
		if (slider_id == editor.lw_slider_suffix)
			return true;
		return false;
	}
	$scope.replay = function(obj, slider_id){

		obj.response.forEach(function(response){
			if(response.type != "livewriting_logs")
				return;
			var logs = response.logs;
			atom.workspace.open("replay" + slider_id + "-" + response.name)
			.then(function(editor){
				if (editor.livewritingMessage == undefined){
					editor.livewritingMessage = require('../services/livewriting.js');
					editor.livewritingMessage("create", "atom", {}, null);
					editor.livewritingMessage("playJson", logs, false);
					editor.lw_slider_suffix = slider_id;
				}
				if(!$scope.sliderInit){
					Slider.initSlider(editor, slider_id, editor.SLIDER_UPDATE_RESOLUTION); // we need to initiate slider only one time.
					$scope.sliderInit = true;
				}
				editor.sliderGoToBeginning();
			});
		});
	};
	$scope.nah = function(obj){
		$scope.isRejecting = !$scope.isRejecting;
	};

	




	// send out the iteration message
	$scope.iterate = function(msg) {
		QuestionManager.sendIterationRequest($scope.selectedObj.question_id, msg);

		$scope.inputs.iterationMsg = "";
		$scope.isRejecting = false;

/*
		$scope.$apply(function() {
			// $scope.myArr[key].status = "Status: Solved!";
				value.status = "Status: Unsolved!";
				angular.element(document.getElementById(response.id)).css('background-color','white')
		})
		*/

	}

}]);
};
