//var RequestView = require('../../requests/requestView');
var $ = require("jquery");
require("jquery-ui");

module.exports = function(app){


app.controller("LiveWritingSliderController", ['Slider', '$scope', '$rootScope',function (Slider,$scope, $rootScope) {

	$scope.slider_on = false;
	$(".codeon-livewriting-slider").draggable();

	Slider.initSlider("",1000);


	var checkActiveEditorForSlider = function(){

		var editor = atom.workspace.getActiveTextEditor();
    if(editor && editor.lw_slider_suffix){
      $scope.slider_on = true;
    }
    else{
      $scope.slider_on = false;
    }
		$scope.$evalAsync();
	}

	atom.workspace.onDidStopChangingActivePaneItem(checkActiveEditorForSlider);
	
	$(".codeon-slider-wrapper").css("visibility", "visible");

}]);
};
