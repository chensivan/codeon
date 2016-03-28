var merge

module.exports = function(app){

app.controller("HelperResponse", ['$scope','$rootScope', 'QuestionManager', 'Slider',function ($scope,$rootScope,QuestionManager, Slider) {
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

	$scope.mySplit = function(response) {
		if(response.hasOwnProperty('name')){
			return response.name;
		}

		if(response.hasOwnProperty('path')){
			var array = response.path.split('/');
	    return array[array.length-1];
		}

	}

	$scope.replay = function(obj, response_id){

		obj.response.forEach(function(response){
			if(response.type != "livewriting_logs")
				return;
			var logs = response.logs;
			atom.workspace.open("replay" + response_id + "-" + response.name)
			.then(function(editor){
				if (editor.livewritingMessage == undefined){
					editor.livewritingMessage = require('../services/livewriting.js');
					editor.livewritingMessage("create", "atom", {}, null);
					editor.livewritingMessage("playJson", logs, false);
					editor.lw_slider_suffix = response_id;
				}/*
				if(!$scope.sliderInit){
					Slider.initSlider(slider_id, editor.SLIDER_UPDATE_RESOLUTION); // we need to initiate slider only one time.
					$scope.sliderInit = true;
					$scope.$evalAsync();
				}
				editor.sliderGoToBeginning();*/
			});
		});
	};

	$scope.collapse = function(obj){
		console.log(obj);
		obj.collapse = !obj.collapse;
	}


}]);
};
