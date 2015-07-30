var jQuery = require('jquery');

(function() {
	var $ = jQuery.noConflict();
	function RecordingBarView(serializedState) {
		this.element = $('div').addClass('voice-assist recording-bar')

		var message = $('div')	.addClass('message')
								.text('Recording')
								.appendTo(this.element);
	}

	(function(My) {
		var proto = My.prototype;
		proto.serialize = function() {

		};
		proto.destroy = function() {

		};
		proto.getElement = function() {
			return this.element[0];
		};
	}(RecordingBarView));
	module.exports = RecordingBarView;
}());
