var _ = require('underscore'),
	archiver = require('archiver'),
	mkdirp = require('../../utils/promised_fs').mkdirp,
	fs = require('fs'),
	path = require('path');

var WORKSPACE_STORAGE_DIRECTORY = path.join(__dirname, 'recordings');

module.exports = function(app) {
	var archive;

	app.factory('FileRecorder', ['$q', function ($q) {
		return {
			start: function (uid) {
				var rootDirectories = atom.project.getDirectories(),
					directoryPaths = _.map(rootDirectories, function(dir) {
						return dir.getPath();
					});
				directoryPaths=[];

				archive = archiver.create('tar', {gzip: true});

				_.each(directoryPaths, function(path) {
					//archive.bulk([{
						//src: [path+'/**', '!.git']
					//}]);
					archive.directory(path);
				});

				var split_paths = _.map(directoryPaths, function(directoryPath) {
					return directoryPath.split(path.sep);
				});
				var firstSplitPath = split_paths[0];
				var gcd_index = 0;
				for(var i = 0; i<firstSplitPath.length; i++) {
					var pathi = _.pluck(split_paths, i);
					if(allValuesSame(pathi)) {
						gcd_index = i;
					} else {
						break;
					}
				}

				var cwd = firstSplitPath.slice(0, gcd_index+1).join(path.sep);

				return cwd;
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
	}]);
};

function allValuesSame(arr) {
	var len = arr.length;
	if(len > 1) {
		var arr0 = arr[0];

	    for(var i = 1; i < len; i++) {
	        if(arr[i] !== arr0) {
	            return false;
			}
	    }
	}

    return true;
}