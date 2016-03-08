var $ = require('jquery'),
	angular = require('angular'),
	_ = require('underscore'),
	pfs = require('../utils/promised_fs'),
	path = require('path');

module.exports = RequestView;

function RequestView() {
	this.element = $('<div />').addClass('codeon recording-bar');
	this.panel = atom.workspace.addTopPanel({
		item: this.getElement(),
		visible: false
	});

	this.app = angular.module('codeon_request', []);

	this.app.constant('STORAGE_DIRECTORY', path.join(__dirname, 'recordings'));

	require('./services/record_editor')(this.app);
	require('./services/record_files')(this.app);
	require('./services/record_voice')(this.app);
	require('./services/upload_recording')(this.app);
	require('./services/recorder')(this.app);
	require('./controllers/recording_bar.controller')(this.app);
	require('../services/slack')(this.app);

	pfs.readFile(path.join(__dirname, 'views', 'recording_bar.view.html'), 'utf8').then(_.bind(function(contents) {
		this.element.html(contents);

		angular.element(this.getElement()).ready(_.bind(function() {
			angular.bootstrap(this.getElement(), ['codeon_request']);
			this._invoke(function(Recorder, $rootScope) {
				$rootScope.$on('begin_codeon_recording', _.bind(function() {
					this.panel.show();
				}, this));
				$rootScope.$on('end_codeon_recording', _.bind(function() {
					this.panel.hide();
				}, this));
			})
		}, this));
	}, this), function(err) {
		console.error(err);
	});
}

(function(My) {
	var proto = My.prototype;

	proto._invoke = function(fn, context) {
		var $injector = angular.element(this.getElement()).injector();
		return $injector.invoke(['Recorder', '$rootScope', _.bind(fn, context||this)]);
	};

	proto.isRecording = function() {
		return this._invoke(function(Recorder) {
			return Recorder.isRecording();
		});
	};

	proto.enable = function() {
		if(!this.isRecording()) {
			this.panel.show();
			console.log("what is this ");
			console.log(this);
			this._invoke(function(Recorder) {
				Recorder.start();
			});
		}
	};
	proto.disable = function() {
		if(this.isRecording()) {
			this.panel.hide();
			this._invoke(function(Recorder) {
				Recorder.stop();
			});
		}
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
	proto.toggle = function() {
		if(this.isRecording()) {
			this.disable();
		} else {
			this.enable();
		}
	};
}(RequestView));
