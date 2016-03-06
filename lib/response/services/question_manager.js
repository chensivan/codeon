var client = require('socket.io-client');
var prefs = require('../../utils/user_preferences');
var _ = require('underscore')

module.exports = function(app) {
	app.factory('QuestionManager', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

		var socket = client.connect(prefs.getServerURL());

		var requestPromises = {};
		var path;
    socket.on('request_uploaded', function(msg) {
        //run it when getting a new notification
				console.log("ok");
        updateMyRequests();
    });


    socket.on('status_updated', function(msg) {
			console.log(msg);
			$rootScope.filePath = msg.path;
			var requestID = msg.requestID;
			requestPromises[requestID].then(function(request) {
				updateRequest(request, requestID, request.updated);
			});
            //run it when getting a new notification
			//delete requestPromises[requestID];
            //updateMyRequests();
    });

    function getJSON(url) {
        return $http({
            url: prefs.getServerURL() + url
        }).then(function(response) {
            return response.data;
        });
    }

		function updateRequest(request, requestID, updated) {
			fetchRequest(requestID, updated).then(function(newInfo) {
				_.extend(request, newInfo)
			});
		}

		function fetchRequest(requestID, updated) {
            var requestPromise = getJSON('/get_question/'+requestID),
                cwdPromise = getJSON('/get_cwd/'+requestID),
                tagsPromise = getJSON('/get_tags/'+requestID),
                statusPromise = getJSON('/get_status/'+requestID);

            return $q.all([requestPromise, cwdPromise, tagsPromise, statusPromise]).then(function(info) {
                var request = info[0],
                    cwd = info[1],
                    tags = info[2],
										status = info[3],
										notification = status.state == "pending" ? "Have not received response."
																	:status.state == "new" ? "You have received a new response."
																	: "This request has been resolved.";
                return _.extend({
                        tags: tags,
                        cwd: cwd,
                        updated: updated,
												status: status,
												notification: notification
                    						}, request);
            });
		}

		function updateMyRequests() {
			getJSON('/editor_questions/' + prefs.getEditorID()).then(function(editor_questions) {
                _.each(editor_questions, function(updated, requestID) {

                    if(requestPromises.hasOwnProperty(requestID)) {
                        requestPromises[requestID].then(function(request) {
                            if(request.updated < updated) {
                                requestPromises[requestID] = fetchRequest(requestID, updated);
                            }
                        });
                    } else {
                        requestPromises[requestID] = fetchRequest(requestID, updated);
                    }
                });
                $q.all(_.values(requestPromises)).then(function(requests) {
                    $rootScope.requests = requests.sort(function(a, b) {
                        return b.updated - a.updated;
                    });
                });
			});
		}

		updateMyRequests();

		var rv = {
			sendIterationRequest: function(requestID, message) {
				socket.emit('iterationRequest', {
					requestID: requestID,
					message: message
				});
			},
			markResolved: function(requestID) {
				socket.emit('setState', {
					requestID: requestID,
					state: 'resolved'
				});
			}
		};

		socket.on('addNotification', function(notification) {
			//rv.emit('response', notification);
			$rootScope.$emit('codemand_response', notification)
		});

		return rv;
	}]);
};
