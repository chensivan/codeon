var merge

module.exports = function(app){

app.controller("HelperResponse", ['$scope','$rootScope', 'QuestionManager', 'Slider', 'RequestReplayer',function ($scope,$rootScope,QuestionManager, Slider,RequestReplayer) {
	$scope.hasReplay = false;
	$scope.show = false;

	var answers = $scope.helper_response.answers;
	//$scope.response_hash_key = $scope.helper_response.$$hashKey.replace(/\D/g,'');
	// create a key for slider;
	//do something with response here and set $scope.hasReplay

	//console.log($scope.helper_response);

	answers.forEach(function(item){
		if(item.type == "livewriting_logs"){
			$scope.hasReplay = true;
			//$scope.response_hash_key = answers.hash
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

		obj.answers.forEach(function(answer){
			if(answer.type != "livewriting_logs")
				return;
			var logs = answer.logs;
			atom.workspace.open("replay" + response_id + "-" + answer.name)
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

	$scope.playVoice = function(obj){
		if($scope.isVoicePlaying){
			RequestReplayer.stopVoice();
			$scope.isVoicePlaying = false ;
		}else{
			$scope.isVoicePlaying = true ;
			RequestReplayer.playVoice($scope.selectedObj.question_id, obj.fileName, function() {
					$scope.isVoicePlaying = false;
			});
		}

	};


}]);
};
