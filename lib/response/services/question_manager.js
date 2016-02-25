var client = require('socket.io-client');
var EventEmitter = require('events');

module.exports = function(app) {
	// see http://jtblin.github.io/angular-chart.js/
	app.factory('QuestionManager', ['$http', '$q', function ($http, $q) {
		var rv = new EventEmitter();

		var socket = client.connect(atom.config.get('voice-assist.uploadURL'));
		socket.on('addNotification', function(notification) {
		
			rv.emit('response', notification);
		});

		return rv;
	}]);
};
