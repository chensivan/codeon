var $ = require('jquery'),
		ResizableWidthView = require('./resizable-width-view'),
		angular = require('angular'),
		angular_route = require('angular-route'),
		_ = require('underscore'),
		angular_animate = require('angular-animate'),
		less = require('less'),
		helpers = require('atom-helpers'),
		fs = require('fs'),
		path = require('path'),
		ng_chartjs = require('angular-chart.js'),
		ng_highlightjs = require('angular-highlightjs');

module.exports = RequestView;

function RequestView(isEnabled) {
	RequestView.__super__.constructor.apply(this, arguments);
	this.panel = atom.workspace.addRightPanel({
		item: this.element
	});

	this.app = angular.module('app', []);

	require('./controllers/recording_bar.controller')(this.app);

	readFile(path.join(__dirname, 'views', 'recording_bar.view.html'), 'utf8').then(_.bind(function(contents) {
		this.mainView.html(contents);

		angular.element(this.mainView).ready(_.bind(function() {
			angular.bootstrap(this.mainView, ['app']);
		}, this));
	}, this), function(err) {
		console.error(err);
	});

	this.enable(isEnabled);
}

(function(My) {
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
}(RequestView));