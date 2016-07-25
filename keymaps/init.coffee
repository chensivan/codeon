atom.commands.add 'atom-text-editor',
  "script:run": (event) ->
    editorElement = atom.views.getView(atom.workspace.getActiveTextEditor())
    atom.commands.dispatch(editorElement, 'script:run')
