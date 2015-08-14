var _ = require('./vendor/underscore'),
	fse = require('fs-extra'),
	archiver = require('archiver'),
	mkdirp = require('./mkdirp'),
	fs = require('fs'),
	path = require('path');

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
			//archive.directory(path);
		});

		var split_paths = _.map(directoryPaths, function(directoryPath) {
			return directoryPath.split(path.sep);
		});
		var firstSplitPath = split_paths[0];
		var gcd_index = -1;
		for(var i = 0; i<firstSplitPath.length; i++) {
			var pathi = _.pluck(split_paths, i);
			if(!allValuesSame(pathi)) {
				gcd_index = i;
			}
		}

		var commonPath = firstSplitPath.slice(0, gcd_index).join(path.sep);

		return commonPath;
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

function allValuesSame(arr) {
	var arr0 = arr[0];

    for(var i = 1; i < arr.length; i++) {
        if(arr[i] !== arr0) {
            return false;
		}
    }

    return true;
}
