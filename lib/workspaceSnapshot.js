var _ = require('./vendor/underscore'),
	archiver = require('archiver'),
	mkdirp = require('./mkdirp'),
	fs = require('fs');

var archive;
var WORKSPACE_STORAGE_DIRECTORY = __dirname + '/recordings/';
var output;
var zipPromise;
var filename;

module.exports = {
	start: function (uid) {
		var rootDirectories = atom.project.getDirectories(),
			directoryPaths = _.map(rootDirectories, function(dir) {
				return dir.getPath();
			});

		var folder = WORKSPACE_STORAGE_DIRECTORY  + uid + '/',
			filename = 'workspace.zip',
			fullFilename = folder + filename;

		zipPromise = mkdirp(folder).then(function() {
			output = fs.createWriteStream(fullFilename);

			var outputClosePromise = new Promise(function(resolve, reject) {
				output.on('close', function() {
					resolve(fullFilename);
				});
			});

			archive = archiver.create('zip', {});
			archive.pipe(output);

			_.each(directoryPaths, function(path) {
				archive.directory(path);
			})

			archive.finalize();
			return outputClosePromise;
		}, function(e) {
			console.error(e.stack);
		});
	},
	stop: function() {
		return zipPromise;
	},
	cancel: function(uid) {
		var folder = WORKSPACE_STORAGE_DIRECTORY  + uid + '/',
			filename = 'workspace.zip',
			fullFilename = folder + filename;

		return zipPromise.then(function(filename) {
			return new Promise(function(resolve) {
				fs.unlink(filename, function() {
					resolve();
				});
			});
		})
	}
};
