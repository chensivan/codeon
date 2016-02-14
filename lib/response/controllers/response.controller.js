module.exports = function(app){

app.controller("ShowRequest", ['$scope',function ($scope) {

	$scope.nah = function(obj){

		if ($scope.why==""){
			$scope.why = "Why?";
		}
		else{
			$scope.why = "";
		}

	};

}]);


};
