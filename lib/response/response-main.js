var ResponseView = require('./responseView');
//MAIN ATOM FILE
module.exports = {
	initialize: function(state) {
		// this.enabled = !!state.enabled;

		//this.parser = new Parser();
		this.responseView = new ResponseView(this.enabled);
		atom.commands.add('atom-workspace', 'atom-codemand:toggle', this.toggle.bind(this));
	},
	destroy: function() {
		//this.parser.destroy();
		this.responseView.destroy();
	},
	serialize: function() {
		return {
			enabled: this.enabled
		};
	},
	toggle: function() {
		this.enabled = !this.enabled;
		this.responseView.enable(this.enabled);
	}
};