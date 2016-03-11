var RequestView = require('./requestView');

//MAIN ATOM FILE
module.exports = {
	initialize: function() {
		this.requestView = new RequestView();
		atom.commands.add('atom-workspace', 'atom-codeon:toggle-recording', this.toggle.bind(this));
	},
	destroy: function() {
		this.requestView.destroy();
	},
	serialize: function() {
		return {};
	},
	toggle: function() {
		//this.requestView.toggle();
		this.requestView.openPrompt();
	}
};
/*

var EventEmitter = require('events').EventEmitter;
var fse = require('fs-extra');
var fsp = require('fs-plus');
var fs = require('fs');
var jsonfile = require('jsonfile');
var util = require('util');
var path = require('path');
var STORAGE_DIRECTORY = path.join(__dirname,'recordings');

var CompositeDisposable, Notification, Notifications, ref;
ref = require('atom'), Notification = ref.Notification, CompositeDisposable = ref.CompositeDisposable;


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
	//read file and see if the q-id is here

	var uid = data.id;
	var message;
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
