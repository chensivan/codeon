module.exports = function(app) {
	// see http://jtblin.github.io/angular-chart.js/
	app.factory('ServerQuery', ['$http', function ($http) {
	    var serverURL = atom.config.get('atom-lang-viz.serverURL');
		var lastChar = serverURL.substr(-1); // Selects the last character
		if (lastChar != '/') {         // If the last character is not a slash
			serverURL = serverURL + '/';            // Append a slash to it.
		}

		return {
			runQuery: function(selectedText) {
				return $http({
					method: 'GET',
					url: serverURL,
					params: {
						query: selectedText
					}
				}).then(function(fullResponse) {
					return fullResponse;
				}, function(err) {
					console.error(err);
				});
			},
			getSuggestedExampleCode: function(language, description) {
				return $http({
					method: 'GET',
					url: serverURL+'sampleCode',
					params: {
						language: language,
						description: description
					}
				}).then(function(response) {
					return response.data;
				});
			}
		};
	}]);
};
