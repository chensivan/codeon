var _ = require('underscore');
var prefs = require('../utils/user_preferences');

module.exports = function(app) {
	app.factory('Slack', ['$q', '$http', function ($q, $http) {
		return {
			postRequest: function(uid, transcript) {
				var text = 'New Request: "'+transcript+'"\n' +
								'<' + prefs.getServerURL()+'#'+ uid + '|(View)>';
				return $http({
					method: 'POST',
					url: prefs.getSlackWebhookURL(),
					data: {
						text: text
					}
				});
			}
		};
	}]);
};