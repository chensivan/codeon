var client = require('socket.io-client');

module.exports = function(app) {
	// see http://jtblin.github.io/angular-chart.js/
	app.factory('ServerQuery', ['$http', '$q', '$emit', function ($http, $q, $emit) {
		var serverURL = atom.config.get('voice-assist.uploadURL');

		return {

		};


		/*
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
		*/
	}]);
};
/*

var client = require('socket.io-client');
var socket = client.connect('http://localhost:3000');
//
//TODO: 2 conditions logic

// if (this is the first time trigger this package)
// 		1) check any updated responses
//		2) set socket on addNotification
// else if (this is not the first time trigger this package)
//		1) listen as always


// if (there is a data.json file)
// 		open file
//	  load all the question objectsID, and their last response timestamp
// 		send the object ID and

var file = path.join(STORAGE_DIRECTORY,'data.json');



socket.on('addNotification', function(data) {
	console.log("client connected: ");
	console.log(data);
	//read file and see if the q-id is here

	var uid = data.id;
	var message;
	console.log("   fewafew");
	var obj = new Object();
	fs.stat(file, function(err, stat){
		if (err == null){
			obj = JSON.parse(fs.readFileSync(file, 'utf8'));
			console.log(obj);

			debugger;
			if(obj.hasOwnProperty(uid)){
				console.log();
				obj[uid].response.push(data.msg);
				atom.notifications.addSuccess("You received one response for this question:\n "+data.id
																			+"\n the response is: "+data.msg);
			}
		}
	});



	// var question = msg[0];
	// var answer = msg[1];

});
*/