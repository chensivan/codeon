var $ = require('jquery'),
	angular = require('angular'),
	_ = require('underscore'),
	pfs = require('../utils/promised_fs'),
	path = require('path');

module.exports = RequestView;

function RequestView(isEnabled) {
	this.element = $('<div />').addClass('codemand recording-bar');
	this.panel = atom.workspace.addTopPanel({
		item: this.getElement(),
		visible: false
	});

	this.app = angular.module('codemand_request', []);

	require('./services/record_editor')(this.app);
	require('./services/record_files')(this.app);
	require('./services/record_voice')(this.app);
	require('./services/upload_recording')(this.app);
	require('./services/recorder')(this.app);
	require('./controllers/recording_bar.controller')(this.app);

	pfs.readFile(path.join(__dirname, 'views', 'recording_bar.view.html'), 'utf8').then(_.bind(function(contents) {
		this.element.html(contents);

		angular.element(this.getElement()).ready(_.bind(function() {
			angular.bootstrap(this.getElement(), ['codemand_request']);
		}, this));
	}, this), function(err) {
		console.error(err);
	});
	//this.enable(isEnabled);
}

(function(My) {
	var proto = My.prototype;

	proto._invoke = function(fn, context) {
		if(!context) { context = this; }
		var injector = angular.injector(['ng', 'codemand_request']);
		return injector.invoke(['Recorder', _.bind(fn, context)]);
	};

	proto.getElement = function() {
		return this.element;
	};

	proto.destroy = function() {
		this._invoke(function(Recorder) {
			Recorder.cancel();
		});
		this.panel.destroy();
	};

	proto.updateVisibility = function() {
		if(this.enabled) {
			this.panel.show();
		} else {
			this.panel.hide();
		}
	};

	proto.updateRecorder = function() {
		this._invoke(function(Recorder) {
			if(this.enabled) {
				Recorder.start();
			} else {
				Recorder.stop();
			}
		});
	};

	proto.enable = function(enable) {
		this.enabled = enable;
		this.updateVisibility();
		this.updateRecorder();
	};
}(RequestView));