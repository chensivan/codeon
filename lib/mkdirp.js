var fse = require('fs-extra');
module.exports = function(path) {
	return new Promise(function(resolve, reject) {
		fse.mkdirp(path, function(err) {
			if(err) {
				reject(err);
			} else {
				resolve(path);
			}
		});
	});
};
