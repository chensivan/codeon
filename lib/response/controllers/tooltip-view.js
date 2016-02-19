'use strict';

class TooltipView {
  constructor() {
    const _workspace = atom.workspace;
    const _workspaceView = atom.views.getView(_workspace);

    this.text = '';
    this.listeners = {};

    // Create element wrapper.
    this.element = require('./tooltip-element-wrapper')();

    // Close the tooltip when the mouse is pressed anywhere on-screen other than the tooltip.
    this.listeners['mousedown'] = (e) => {
      if(!this.element.isOpen()) return;

      const _isPickerEvent = this.element.hasChild(e.target);
      if(!_isPickerEvent) return this.close();
    };

    // Close the tooltip when the window is resized.
    this.listeners['resize'] = (e) => {
      return this.close();
    };

    // Register all window event listeners.
    const listenerKeys = Object.keys(this.listeners);
    for(let i = 0; i < listenerKeys.length; i++) {
      window.addEventListener(listenerKeys[i], this.listeners[listenerKeys[i]], true);
    }

    // Close the tooltip when any key is pressed, unless it is focused on the tooltip.
    _workspaceView.addEventListener('keydown', (e) => {
      if(!this.element.isOpen()) return;

      const _isPickerEvent = this.element.hasChild(e.target);
      if(!_isPickerEvent) return this.close();
    });

    // Close the tooltip when the workspace scrolls.
    atom.workspace.observeTextEditors((editor) => {
      const _editorView = atom.views.getView(editor);
      const _subscriptionTop = _editorView.onDidChangeScrollTop(() => this.close());
      const _subscriptionLeft = _editorView.onDidChangeScrollLeft(() => this.close());

      editor.onDidDestroy(function() {
        _subscriptionTop.dispose();
        _subscriptionLeft.dispose();
      });
    });

    // Close it when the active workspace item changes.
    _workspace.getActivePane().onDidChangeActiveItem(() => this.close());

    // Add the tooltip element to the workspace.
    this.Parent = atom.views.getView(atom.workspace).querySelector('.vertical');
    this.Parent.appendChild(this.element.el);

    // Create tooltip content element.
    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = this.text;

    // Add the content element to the main tooltip element.
    this.element.add(content);
    this.element.content = content;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    // Detatch all event listeners.
    for(let i = 0; i < listenerKeys.length; i++) {
      window.removeEventListener(listenerKeys[i], this.listeners[listenerKeys[i]]);
    }

    // Destroy element.
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  setText(text) {
    this.text = text;
    this.element.content.textContent = this.text;
  }

  open() {
    const Editor = atom.workspace.getActiveTextEditor();
    const EditorView = atom.views.getView(Editor);

    if(!EditorView) return;

    const EditorRoot = EditorView.shadowRoot || EditorView;

    // Find the current cursor
    const Cursor = Editor.getLastCursor();

    // Exit if the cursor is out of view.
    const _visibleRowRange = EditorView.getVisibleRowRange();
    const _cursorScreenRow = Cursor.getScreenRow();
    const _cursorBufferRow = Cursor.getBufferRow();

    if((_cursorScreenRow < _visibleRowRange[0]) || (_cursorScreenRow > _visibleRowRange[1])) return;

    const _cursorPosition = Cursor.getPixelRect();

    // Get information about the editor.
    const PaneView = atom.views.getView(atom.workspace.getActivePane());
    const _paneOffsetTop = PaneView.offsetTop;
    const _paneOffsetLeft = PaneView.offsetLeft;

    const _editorOffsetTop = EditorView.parentNode.offsetTop;
    const _editorOffsetLeft = EditorRoot.querySelector('.scroll-view').offsetLeft;
    const _editorScrollTop = EditorView.getScrollTop();

    const _lineHeight = Editor.getLineHeightInPixels();
    const _lineOffsetLeft = EditorRoot.querySelector('.line').offsetLeft;

    // Calculate Top Offset
    const _totalOffsetTop = _paneOffsetTop + _cursorPosition.height - _editorScrollTop + _editorOffsetTop;
    // Calculate Left Offset
    const _totalOffsetLeft = _paneOffsetLeft + _editorOffsetLeft + _lineOffsetLeft;

    const _position = {
      x: _cursorPosition.left + _totalOffsetLeft,
      y: _cursorPosition.top + _totalOffsetTop,
    };

    // Calculate boundaries and flip the vertical alignment if needed.
    const _tooltipPosition = {
      x: (() => {
        const _tooltipWidth = this.element.width();
        const _halfColorPickerWidth = (_tooltipWidth / 2) << 0;

        // Make sure the tooltip isn't too far to the left.
        let _x = Math.max(10, _position.x - _halfColorPickerWidth);

        // Make sure the tooltip isn't too far to the right
        _x = Math.min(this.Parent.offsetWidth - _tooltipWidth - 10, _x);

        return _x;
      })(),
      y: (() => {
        this.element.unflip();

        // If the tooltip is too far down, flip it.
        if(this.element.height() + _position.y > this.Parent.offsetHeight - 32) {
          this.element.flip();
          return _position.y - _lineHeight - this.element.height();
        } else {
          // Otherwise keep the Y position.
          return _position.y;
        }
      })(),
    };

    // Set the tooltip position.
    this.element.setPosition(_tooltipPosition.x, _tooltipPosition.y);

    // Open the tooltip.
    requestAnimationFrame(() => {
      this.element.open();
    });

    return true;
  }

  close() {
    this.element.close();
    return true;
  }
}

module.exports = TooltipView;
