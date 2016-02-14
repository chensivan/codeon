module.exports = function(app){

	app.controller("ShowRequest", ['$scope',function ($scope) {
		$scope.myClick = function(obj){
			console.log(obj.id);
		}
	}]);

};
