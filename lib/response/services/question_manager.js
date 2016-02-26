var client = require('socket.io-client');
var prefs = require('../../utils/user_preferences');

module.exports = function(app) {
	app.factory('QuestionManager', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
		var socket = client.connect(prefs.getServerURL());

        function getJSON(url) {
            return $http({
                url: prefs.getServerURL() + url
            }).then(function(response) {
                return response.data;
            });
        }

		function getRequest(requestID) {
            var requestPromise = getJSON('/get_question/'+requestID),
                cwdPromise = getJSON('/get_cwd/'+requestID),
                tagsPromise = getJSON('/get_tags/'+requestID);

            return $q.all([requestPromise, cwdPromise, tagsPromise]).then(function(info) {
                var request = info[0],
                    cwd = info[1],
                    tags = info[2];

                return _.extend({
                        tags: tags,
                        cwd: cwd,
                        updated: updated
                    }, request);
            });
		}

		function updateMyRequests() {
			getJSON('/editor_questions/' + prefs.getEditorID()).then(function(editor_questions) {
				console.log(editor_questions);
			});
		}

		updateMyRequests();

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