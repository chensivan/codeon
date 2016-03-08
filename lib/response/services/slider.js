var client = require('socket.io-client');
var prefs = require('../../utils/user_preferences');
var _ = require('underscore')
var $ = require('jquery');

// load everything
require('jquery-ui');


module.exports = function(app) {
	app.factory('Slider', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
		return {
			initSlider: function( editor, id, SLIDER_UPDATE_RESOLUTION){
				
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
		};
	}]);
};
