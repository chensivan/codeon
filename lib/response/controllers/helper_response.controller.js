module.exports = function(app){

app.controller("HelperResponse", ['$scope','$rootScope',function ($scope,$rootScope) {
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

	var initSlider = function( id, SLIDER_UPDATE_RESOLUTION){
		console.log("initSlider started");

		var slider = $('.livewriting_slider').slider({
			min: 0.0,
			max:SLIDER_UPDATE_RESOLUTION,
			slide: function(event, ui){
				var editor = atom.workspace.getActiveTextEditor();
				if (id != editor.lw_slider_suffix)
					return;
				editor.sliderEventHandler(event, ui);
			}
		});


		$( "#lw_toolbar_beginning" + id ).button({
			text: false,
			icons: {
				primary: "ui-icon-seek-start"
			},
			click:null
		}).click(function(){
			var editor = atom.workspace.getActiveTextEditor();
			if (id != editor.lw_slider_suffix)
				return;
			editor.sliderGoToBeginning();
		});

		$( "#lw_toolbar_slower" + id).button({
			text: false,
			icons: {
				primary: "ui-icon-minusthick"
			},
			click:null
		}).click(function(){
			var editor = atom.workspace.getActiveTextEditor();
			if (id != editor.lw_slider_suffix)
				return;
			var sliderValue  = $("#livewriting_slider"+ id).slider("value");
			editor.halfTheSpeed(sliderValue);
			$("#livewriting_speed"+ id).text(editor.lw_playback);
		});

		$( "#lw_toolbar_play"+ id ).button({
			text: false,
			icons: {
				primary: "ui-icon-pause"
			},
			click:null
		})
		.click(function() {
			var editor = atom.workspace.getActiveTextEditor();
			if (id != editor.lw_slider_suffix)
				return;
			if ( $( this ).text() === "pause" ) {
				editor.livewritingPause();
			} else {
				editor.livewritingResume();
			}
		});
		$( "#lw_toolbar_faster" + id).button({
			text: false,
			icons: {
				primary: "ui-icon-plusthick"
			},
			click:null
		}).click(function(){
			var editor = atom.workspace.getActiveTextEditor();
			if (id != editor.lw_slider_suffix)
				return;
			var sliderValue  = $("#livewriting_slider"+ editor.lw_slider_suffix).slider("value");
			editor.doubleTheSpeed(sliderValue);
			$("#livewriting_speed"+ id).text(editor.lw_playback);
		});
		$( "#lw_toolbar_end"+ id ).button({
			text: false,
			icons: {
				primary: "ui-icon-seek-end"
			},
			click:null
		}).click(function(){
			var editor = atom.workspace.getActiveTextEditor();
			if (id != editor.lw_slider_suffix)
				return;
			editor.sliderGoToEnd();
		});
	}
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
					initSlider(slider_id, editor.SLIDER_UPDATE_RESOLUTION); // we need to initiate slider only one time.
					$scope.sliderInit = true;
				}
				editor.sliderGoToBeginning();
			});
		});
	};

}]);
};
