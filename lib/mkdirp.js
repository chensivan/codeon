var mkdirpLib = require('mkdirp');
module.exports = function(path) {
	return new Promise(function(resolve, reject) {
		mkdirpLib(path, function(err) {
			if(err) {
				reject(err);
			} else {
				resolve(path);
			}
		});
	});
};
