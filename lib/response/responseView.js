var $ = require('jquery'),
	ResizableWidthView = require('./resizable-width-view'),
	angular = require('angular'),
	angular_route = require('angular-route'),
	_ = require('underscore'),
	helpers = require('atom-helpers'),
	fs = require('fs'),
	path = require('path'),
	ng_chartjs = require('angular-chart.js'),
	ng_highlightjs = require('angular-highlightjs');

module.exports = VizView;

function VizView(isEnabled) {
	VizView.__super__.constructor.apply(this, arguments);
	this.panel = atom.workspace.addRightPanel({
		item: this.element
	});

	this.app = angular.module('app', []);

	// console.log("1");
	// require('../services/server_query')(this.app);
	require('./controllers/main.controller')(this.app);
	require('./controllers/response.controller')(this.app);
	require('./services/question_manager')(this.app);
	// require('./controllers/suggested_examples.controller')(this.app);
	// console.log("2");

	readFile(path.join(__dirname, 'views', 'main.view.html'), 'utf8').then(_.bind(function(contents) {
		this.mainView.html(contents);

		angular.element(this.mainView).ready(_.bind(function() {
			angular.bootstrap(this.mainView, ['app']);
			// console.log(this.mainView.html());
		}, this));
	}, this), function(err) {
		console.error(err);
	});

	this.enable(isEnabled);
}

(function(My) {
	helpers.extends(VizView, ResizableWidthView);
	var proto = My.prototype;

	proto.destroy = function() {
		this.panel.destroy();
	};

	proto.setVisibility = function() {
		if(this.enabled) {
			this.panel.show();
		} else {
			this.panel.hide();
		}
	};

	proto.enable = function(enable) {
		this.enabled = enable;
		this.setVisibility();
	};
}(VizView));

function readFile(filename, encoding) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filename, encoding, function(err, data) {
			if(err) { reject(err); }
			else { resolve(data); }
		});
	});
}
