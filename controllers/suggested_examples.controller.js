module.exports = function(app) {
	var _ = require('underscore');

	app.controller("SuggestedExamplesController", ['$scope', 'ServerQuery', function ($scope, ServerQuery) {
		// Whenever the selection changes, update the data
		var disposeObserve = atom.workspace.observeTextEditors(function(editor) {
			var tokenizedLines = false;

			editor.onDidStopChanging(function(event) {
				var grammar = editor.getGrammar();
				tokenizedLines = grammar.tokenizeLines(editor.getText());
				var cursorPosition = editor.getCursorBufferPosition(),
					cursorColumn = cursorPosition.column,
					cursorLine = cursorPosition.row,
					tokenizedLine = tokenizedLines[cursorLine];

				var currColumn = 0;
				var commentContent = _.find(tokenizedLine, function(token) {
					var scopes = token.scopes,
						value = token.value,
						blockIsComment = _.some(scopes, function(scopeName) {
							return scopeName.indexOf('comment')>=0;
						}),
						tokenLength = value.length;

					if(blockIsComment && currColumn <= cursorColumn && currColumn + tokenLength >= cursorColumn) {
						return true;
					} else {
						currColumn += tokenLength;
						return false;
					}
				});

				if(commentContent) {
					doQueryForComment(grammar.name, commentContent.value, cursorPosition, editor);
				}
			});
		});

		$scope.$on('$destroy', function() {
			disposeObserve();
		});

		$scope.importExample = function(example) {
			var editor = $scope.examplesEditor,
				cursorPosition = $scope.examplesCursorPosition,
				code = example.code;
				
			editor.insertNewline();
			editor.insertText(code, {
				select: true,
				autoIndent: true,
				autoIndentNewline: true,
				autoDecreaseIndent: true,
				undo: true
			});
		};

		function doQueryForComment(language, description, cursorPosition, editor) {
			return ServerQuery.getSuggestedExampleCode(language, description).then(function(codeSamples) {
				$scope.examples = codeSamples.examples;
				$scope.examplesEditor = editor;
				$scope.examplesCursorPosition = cursorPosition;
			});
		}
	}]);

	function isInComment(cursor) {
	}
};