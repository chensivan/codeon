var jQuery = require('jquery');
var EventEmitter = require('events').EventEmitter;

module.exports = (function() {
	var $ = jQuery.noConflict();
	function RecordingBarView(serializedState) {
		this.element = $('<div />').addClass('voice-assist recording-bar');

		var message = $('<span />')	.addClass('message')
									.text('Recording')
									.appendTo(this.element);

		var doneButton = $('<button />').attr({
				type: 'button'
			}).addClass('btn icon icon-primitive-square settings')
			.appendTo(this.element)
			.on('click', function() {
				$(this).trigger('done');
			})
			.text('Done');

		var cancelButton = $('<button />').attr({
				type: 'button'
			}).addClass('btn icon icon-x settings')
			.appendTo(this.element)
			.on('click', function() {
				$(this).trigger('cancel');
			})
			.text('Cancel');
	}

	(function(My) {
		var proto = My.prototype;
		proto.serialize = function() {

		};
		proto.destroy = function() {

		};
		proto.$getElement = function() {
			return this.element;
		};
		proto.getElement = function() {
			return this.$getElement()[0];
		};
	}(RecordingBarView));

	return RecordingBarView;
}());
