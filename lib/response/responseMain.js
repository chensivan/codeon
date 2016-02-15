var VizView = require('./responseView');
//MAIN ATOM FILE
module.exports = {
	initialize: function(state) {
		// this.enabled = !!state.enabled;
		console.log(" response checking");

		//this.parser = new Parser();
		this.vizView = new VizView(this.enabled);
		atom.commands.add('atom-workspace', 'atom-lang-viz:toggle', this.toggle.bind(this));
	},
	destroy: function() {
		//this.parser.destroy();
		this.vizView.destroy();
	},
	serialize: function() {
		return {
			enabled: this.enabled
		};
	},
	toggle: function() {
		this.enabled = !this.enabled;
		this.vizView.enable(this.enabled);
	}
};
