var VizView = require('./viz-view');
//MAIN ATOM FILE
module.exports = {
	activate: function(state) {
		this.enabled = !!state.enabled;

		//this.parser = new Parser();
		this.vizView = new VizView(this.enabled);

		atom.commands.add('atom-workspace', 'atom-lang-viz:toggle', this.toggle.bind(this));
	},
	deactivate: function() {
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
	},
	config: {
		serverURL: {
			type: 'string',
			default: 'http://localhost:3000/'
		}
	}
};
