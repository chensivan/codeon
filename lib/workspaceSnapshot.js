var _ = require('./vendor/underscore'),
	fse = require('fs-extra'),
	archiver = require('archiver'),
	mkdirp = require('./mkdirp'),
	fs = require('fs');

var archive;
var WORKSPACE_STORAGE_DIRECTORY = __dirname + '/recordings/';

module.exports = {
	start: function (uid) {
		var rootDirectories = atom.project.getDirectories(),
			directoryPaths = _.map(rootDirectories, function(dir) {
				return dir.getPath();
			});

		archive = archiver.create('tar', {gzip: true});

		_.each(directoryPaths, function(path) {
			//archive.bulk([{
				//src: [path+'/**', '!.git']
			//}]);
			archive.directory(path);
		})
	},
	stop: function(uid) {
		var folder = WORKSPACE_STORAGE_DIRECTORY,
			filename = uid + '.tar.gz',
			fullFilename = folder + filename;

		var output = fs.createWriteStream(fullFilename);
		var outputClosePromise = new Promise(function(resolve, reject) {
			output.on('close', function() {
				resolve(fullFilename);
			});
		});

		archive.pipe(output);

		archive.finalize();

		return outputClosePromise;
	},
	cancel: function(uid) {
		archive.abort();
		archive = false;
	},
	addFile: function(path, filename) {
		archive.file(path, {name: filename});
	}
};
