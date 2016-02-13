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

	this.app = angular.module('app', ['chart.js', 'hljs'])
										.config(['ChartJsProvider', 'hljsServiceProvider', function (ChartJsProvider, hljsServiceProvider) {
											hljsServiceProvider.setOptions({
												// replace tab with 4 spaces
												tabReplace: '    '
											});

											// Configure all charts
											ChartJsProvider.setOptions({
												colours: ['#FF5252', '#FF8A80'],
												responsive: false
											});
											// Configure all line charts
											ChartJsProvider.setOptions('Line', {
												datasetFill: false
											});
										}])
										.value('Server URL');

	require('../services/server_query')(this.app);
	require('../controllers/main.controller')(this.app);
	require('../controllers/suggested_examples.controller')(this.app);

	readFile(path.join(__dirname, '..', 'views', 'main.view.html'), 'utf8').then(_.bind(function(contents) {
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
