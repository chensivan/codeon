var client = require('socket.io-client');
var prefs = require('../../utils/user_preferences');
var _ = require('underscore')

module.exports = function(app) {
	app.factory('QuestionManager', ['AlertMessageHandler','$http', '$q', '$rootScope', function (AlertMessageHandler,$http, $q, $rootScope) {

		var isConnected = false;

		var socket = client.connect(prefs.getServerURL(), {
	    reconnection: false
		});

		/* handle connection even handler */
		socket.on('connect_error', function(){
			console.error('CodeOn - Connection Failed :'+prefs.getServerURL());
			atom.notifications.addWarning('CodeOn - Connection Error: '+prefs.getServerURL() + " \n Check your server and restart your Atom.io");
		});

		socket.on('connect_timeout', function(){
			console.error('CodeOn - Connection Timeout :'+prefs.getServerURL());
			atom.notifications.addWarning(prefs.getServerURL());
		});

		socket.on('connect', function(){
		  //console.log('Connected');
			//alert('CodeOn - Connected with :'+prefs.getServerURL());
		});
/*
		socket.on('reconnect', function(){
		  console.log('Reconnected');
			alert('CodeOn - Reconnected with :'+prefs.getServerURL());

		});
*/
		socket.on('disconnect', function () {
			console.log('Disconnected');
			atom.notifications.addWarning('CodeOn - Disconnected with: '+prefs.getServerURL() + " \n Check your server and restart your Atom.io");

		});

		var requestPromises = {};

		var path;
    socket.on('request_uploaded', function(msg) {
      //run it when getting a new notification
			debugger;
			console.log("request_uploaded");
      updateMyRequests();
			atom.beep();
			AlertMessageHandler.alertMessage("Title", "Your request is posted!", "info", 3000);

    });


		//message_updated
		socket.on('message_updated', function(msg) {
			debugger;
			AlertMessageHandler.alertMessage("Title", "You received a new comment!", "info", 3000);
			requestPromises[msg.requestID].then(function(request) {
				request.status.discussion = msg.discussion;
				request.status.state = msg.state;
				request.notification = "You received a new comment";
			});
		});

	  socket.on('status_updated', function(msg) {
			debugger;
			if(msg.typeOfUpdate == "responseUpdate"){

				requestPromises[msg.requestID].then(function(request) {
					request.status.state = msg.state;
					request.notification = "Waiting for actions";
					if(msg.state=='resolved'){
						request.notification = "This request has been resolved.";
					}
				});
			}
		});

		socket.on('getMeCode',function(data){
			debugger;
			debugger;
			var ed = atom.workspace.getTextEditors();
			_.each(ed, function(editor){
				if(data.path == editor.getPath()){
					socket.emit('requestCurrentCode', {
						requestID: data.requestID,
						code: editor.getText()
					});
				}
			})
		});

    socket.on('new_response', function(msg) {
			//two states: change title, and getting a response
			// debugger;

			debugger

			AlertMessageHandler.alertMessage("Title", "You received a new response!", "info", 3000);
			requestPromises[msg.requestID].then(function(request) {
				request.status.responses = msg.responses;
				request.status.state = msg.state;
				request.notification = "You received a new response";
				// console.log(request)
			});


			//if it is marking waiting for actions

			//
			// console.log(msg);
			// $rootScope.filePath = msg.path;
			// var requestID = msg.requestID;
			// var exist = false;
 		// 	var requestArray = $rootScope.requests;
			//
			//
			// //if requestID is one in scope.requesst
			// for (var i=0;i<requestArray.length;i++){
			// 	if(requestArray[i].question_id==requestID){
			// 		 exist = true;
			// 		 break;
			// 	}
			// }
			//
			// if(exist){
			// 	requestPromises[requestID].then(function(request) {
			// 		//
			// 		// if(msg.newTranscript.length!=0)
			// 		// 	request.transcript = msg.newTranscript[msg.newTranscript.length-1].transcript;
			// 		// if(msg.newTitle.length!=0)
			// 		// 	request.title = msg.newTitle[msg.newTitle.length-1].title;
			//
			// 		updateRequest(request, requestID, request.updated);
			//
			// 	});
			// }
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
				newInfo.transcript = request.transcript;
				newInfo.title = request.title;
				_.extend(request, newInfo);

			});
		}

		function fetchRequest(requestID, updated) {
            var requestPromise = getJSON('/get_question/'+requestID),
                cwdPromise = getJSON('/get_cwd/'+requestID),
                tagsPromise = getJSON('/get_tags/'+requestID),
								transcriptPromise = getJSON('/get_transcript/'+requestID),
                statusPromise = getJSON('/get_status/'+requestID);

            return $q.all([requestPromise, cwdPromise, tagsPromise, transcriptPromise, statusPromise]).then(function(info) {

                var request = info[0],
                    cwd = info[1],
                    tags = info[2],
										transcription = info[3],
										status = info[4],
										notification = status.state == "pending" ? "Have not received response."
																	:status.state == "new" ? "You received a new response."
																	:status.state == "new_comment" ? "You received a new comment"
																	:status.state == "action" ? "Waiting for actions"
																	: "This request has been resolved.";


                return _.extend({
                        tags: tags,
												transcription: transcription,
                        cwd: cwd,
                        updated: updated,
												status: status,
												hasView: false,
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
		//when first open Atom
		updateMyRequests();

		var rv = {
			sendIterationRequest: function(requestID, message) {
				socket.emit('messageFromRequester', {
					requestID: requestID,
					value: message,
					state: 'pending'
				});
			},
			markResolved: function(requestID) {
				socket.emit('setState', {
					requestID: requestID,
					state: 'resolved'
				});
			},
			anyChanges: function(){
				socket.emit('somethingIsChangingOnRequeterSide');
			},
			markWaitingForAction: function(requestID){
				socket.emit('setState', {
					requestID: requestID,
					state: 'action'
				});
			},
			isConnected: function() {
				return socket.io.connected;
			},
			reconnect: function() {
				socket.io.reconnect();
			},
			updateTranscript: function(requestID, transcript){
				socket.emit('updateTranscript', {
					requestID: requestID,
					editedTranscript: transcript
				});
			},
			updateTitle: function(requestID, title){
				console.log(title);
				socket.emit('updateTitle', {
					requestID: requestID,
					editedTitle: title
				});
			}
		};

		socket.on('addNotification', function(notification) {
			//rv.emit('response', notification);
			$rootScope.$emit('codeon_response', notification)
		});

		return rv;
	}]);
};
