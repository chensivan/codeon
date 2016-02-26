var client = require('socket.io-client');
var prefs = require('../../utils/user_preferences');

module.exports = function(app) {
	app.factory('QuestionManager', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
		var socket = client.connect(prefs.getServerURL());

		var rv = {
			sendIterationRequest: function(content) {
				socket.emit('iterationRequest', content);
			}
		};

		socket.on('addNotification', function(notification) {
			//rv.emit('response', notification);
			$rootScope.$emit('codemand_response', notification)
		});

		return rv;
	}]);
};