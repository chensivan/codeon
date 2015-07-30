//var jQuery = require('jquery');

(function() {
	//var $ = jQuery.noConflict();
	function RecordingBarView(serializedState) {
		this.element = document.createElement('div');
		this.element.textContent = 'Start Recording';
		//this.element = $('div').addClass('voice-assist recording-bar')

		//var message = $('div')	.addClass('message')
								//.text('Recording')
								//.appendTo(this.element);
	}

	(function(My) {
		var proto = My.prototype;
		proto.serialize = function() {

		};
		proto.destroy = function() {

		};
		proto.getElement = function() {
			return this.element;
		};
	}(RecordingBarView));
	module.exports = RecordingBarView;
}());
