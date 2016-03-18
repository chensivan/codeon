var $ = require('jquery');

// load everything
require('jquery-ui');


module.exports = function(app) {
	console.log("AlertMessageHandler init");
	app.factory('AlertMessageHandler', [ '$rootScope', function ( $rootScope) {
		return {
			alertMessage: function(title, text, type , time){

				atom.notifications.addSuccess(text);

				//
	      // $("#codeon-alert-msg").addClass("alert-" + type);
	      // $("#codeon-alert-msg").text(text);
	      // $("#codeon-alert-msg").fadeIn( 300 ).delay( time ).fadeOut( 400 );
			}
		};
	}]);
};
