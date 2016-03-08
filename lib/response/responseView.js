var $ = require('jquery'),
	ResizableWidthView = require('../utils/resizable-width-view'),
	angular = require('angular'),
	angular_route = require('angular-route'),
	_ = require('underscore'),
	angular_animate = require('angular-animate'),
	angular_moment = require('angular-moment'),
	less = require('less'),
	helpers = require('atom-helpers'),
	pfs = require('../utils/promised_fs'),
	path = require('path');

module.exports = ResponseView;

function ResponseView(isEnabled) {
	ResponseView.__super__.constructor.apply(this, arguments);
	this.panel = atom.workspace.addRightPanel({
		item: this.element
	});

	this.app = angular.module('codemand_response', ['angularMoment']);

	require('./controllers/helper_response.controller')(this.app);
	require('./controllers/response_panel.controller')(this.app);
	require('./controllers/request.controller')(this.app);
	require('./services/question_manager')(this.app);
	require('./services/response_manager')(this.app);
	require('./services/slider')(this.app);

	pfs.readFile(path.join(__dirname, 'views', 'response_panel.view.html'), 'utf8').then(_.bind(function(contents) {

		this.mainView.html(contents);

		angular.element(this.mainView).ready(_.bind(function() {
			angular.bootstrap(this.mainView, ['codemand_response']);
		}, this));
	}, this), function(err) {
		console.error(err);
	});

	this.enable(isEnabled);
}

(function(My) {
	helpers.extends(ResponseView, ResizableWidthView);
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
}(ResponseView));
