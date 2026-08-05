/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Functionality for the right-click context menus.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.ContextMenu
 * @namespace
 */
goog.provide('Blockly.ContextMenu');

goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.scratchBlocksUtils');
goog.require('Blockly.utils');
goog.require('Blockly.utils.uiMenu');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.userAgent');


/**
 * Which block is the context menu attached to?
 * @type {Blockly.Block}
 */
Blockly.ContextMenu.currentBlock = null;

/**
 * Which group is the context menu attached to?
 * @type {Blockly.Group}
 */
Blockly.ContextMenu.currentGroup = null;

/**
 * Opaque data that can be passed to unbindEvent_.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.ContextMenu.eventWrapper_ = null;

/**
 * Construct the menu based on the list of options and show the menu.
 * @param {!Event} e Mouse event.
 * @param {!Array.<!Object>} options Array of menu options.
 * @param {boolean} rtl True if RTL, false if LTR.
 */
Blockly.ContextMenu.show = function(e, options, rtl) {
  Blockly.WidgetDiv.show(Blockly.ContextMenu, rtl, null);
  if (!options.length) {
    Blockly.ContextMenu.hide();
    return;
  }
  var menu = Blockly.ContextMenu.populate_(options, rtl);

  goog.events.listen(
      menu, goog.ui.Component.EventType.ACTION, Blockly.ContextMenu.hide);

  Blockly.ContextMenu.position_(menu, e, rtl);
  // 1ms delay is required for focusing on context menus because some other
  // mouse event is still waiting in the queue and clears focus.
  setTimeout(function() {menu.getElement().focus();}, 1);
  Blockly.ContextMenu.currentBlock = null;  // May be set by Blockly.Block.
  Blockly.ContextMenu.currentGroup = null;  // May be set by Blockly.Group.
};

/**
 * Create the context menu object and populate it with the given options.
 * @param {!Array.<!Object>} options Array of menu options.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @return {!goog.ui.Menu} The menu that will be shown on right click.
 * @private
 */
Blockly.ContextMenu.populate_ = function(options, rtl) {
  /* Here's what one option object looks like:
    {text: 'Make It So',
     enabled: true,
     callback: Blockly.MakeItSo}
  */
  var menu = new goog.ui.Menu();
  menu.setRightToLeft(rtl);

  // Sometimes the context menu can be created such that the mouse is hovering over an item in the menu
  // When this happens, a contextmenu event is immediately sent to that item
  // Obviously we don't want that to trigger an item to be selected.
  var acceptContextMenuEvents = false;
  setTimeout(function() {
    acceptContextMenuEvents = true;
  });

  for (var i = 0, option; option = options[i]; i++) {
    if (option.separator === true) {
      var separator = new goog.ui.MenuSeparator();
      menu.addChild(separator, true);
    }
    var menuItem = new goog.ui.MenuItem(option.text);
    menuItem.setRightToLeft(rtl);
    menu.addChild(menuItem, true);
    menuItem.setEnabled(option.enabled);
    if (option.enabled) {
      goog.events.listen(
          menuItem, goog.ui.Component.EventType.ACTION, option.callback);
      menuItem.handleContextMenu = function(/* e */) {
        if (!acceptContextMenuEvents) {
          return;
        }
        // Right-clicking on menu option should count as a click.
        goog.events.dispatchEvent(this, goog.ui.Component.EventType.ACTION);
      };
    }
  }
  return menu;
};

/**
 * Add the menu to the page and position it correctly.
 * @param {!goog.ui.Menu} menu The menu to add and position.
 * @param {!Event} e Mouse event for the right click that is making the context
 *     menu appear.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @private
 */
Blockly.ContextMenu.position_ = function(menu, e, rtl) {
  // Record windowSize and scrollOffset before adding menu.
  var viewportBBox = Blockly.utils.getViewportBBox();
  // This one is just a point, but we'll pretend that it's a rect so we can use
  // some helper functions.
  var anchorBBox = {
    top: e.clientY + viewportBBox.top,
    bottom: e.clientY + viewportBBox.top,
    left: e.clientX + viewportBBox.left,
    right: e.clientX + viewportBBox.left
  };

  Blockly.ContextMenu.createWidget_(menu);
  var menuSize = Blockly.utils.uiMenu.getSize(menu);

  if (rtl) {
    Blockly.utils.uiMenu.adjustBBoxesForRTL(viewportBBox, anchorBBox, menuSize);
  }

  Blockly.WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, menuSize, rtl);
  // Calling menuDom.focus() has to wait until after the menu has been placed
  // correctly.  Otherwise it will cause a page scroll to get the misplaced menu
  // in view.  See issue #1329.
  menu.getElement().focus();

  // https://github.com/LLK/scratch-blocks/pull/2834
  menu.setVisible(true, true, e);
};

/**
 * Create and render the menu widget inside Blockly's widget div.
 * @param {!goog.ui.Menu} menu The menu to add to the widget div.
 * @private
 */
Blockly.ContextMenu.createWidget_ = function(menu) {
  var div = Blockly.WidgetDiv.DIV;
  menu.render(div);
  var menuDom = menu.getElement();
  Blockly.utils.addClass(menuDom, 'blocklyContextMenu');
  // Prevent system context menu when right-clicking a Blockly context menu.
  Blockly.bindEventWithChecks_(
      menuDom, 'contextmenu', null, Blockly.utils.noEvent);
  // Enable autofocus after the initial render to avoid issue #1329.
  menu.setAllowAutoFocus(true);
};

/**
 * Hide the context menu.
 */
Blockly.ContextMenu.hide = function() {
  Blockly.WidgetDiv.hideIfOwner(Blockly.ContextMenu);
  Blockly.ContextMenu.currentBlock = null;
  Blockly.ContextMenu.currentGroup = null;
  if (Blockly.ContextMenu.eventWrapper_) {
    Blockly.unbindEvent_(Blockly.ContextMenu.eventWrapper_);
  }
};

/**
 * Create a callback function that creates and configures a block,
 *   then places the new block next to the original.
 * @param {!Blockly.Block} block Original block.
 * @param {!Element} xml XML representation of new block.
 * @return {!Function} Function that creates a block.
 */
Blockly.ContextMenu.callbackFactory = function(block, xml) {
  return function() {
    Blockly.Events.disable();
    try {
      var newBlock = Blockly.Xml.domToBlock(xml, block.workspace);
      // Move the new block next to the old block.
      var xy = block.getRelativeToSurfaceXY();
      if (block.RTL) {
        xy.x -= Blockly.SNAP_RADIUS;
      } else {
        xy.x += Blockly.SNAP_RADIUS;
      }
      xy.y += Blockly.SNAP_RADIUS * 2;
      newBlock.moveBy(xy.x, xy.y);
    } finally {
      Blockly.Events.enable();
    }
    if (Blockly.Events.isEnabled() && !newBlock.isShadow()) {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
    }
    newBlock.select();
  };
};

// Helper functions for creating context menu options.

/**
 * Make a context menu option for deleting the current block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockDeleteOption = function(block) {
  // Option to delete this block but not blocks lower in the stack.
  // Count the number of blocks that are nested in this block,
  // ignoring shadows and without ordering.
  var descendantCount = block.getDescendants(false, true).length;
  var nextBlock = block.getNextBlock();
  if (nextBlock) {
    // Blocks in the current stack would survive this block's deletion.
    descendantCount -= nextBlock.getDescendants(false, true).length;
  }
  var deleteOption = {
    text: descendantCount == 1 ? Blockly.Msg.DELETE_BLOCK :
        Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
    enabled: true,
    callback: function() {
      Blockly.Events.setGroup(true);
      block.dispose(true, true);
      Blockly.Events.setGroup(false);
    }
  };
  return deleteOption;
};

Blockly.ContextMenu.blockCollapseOption = function(block) {
  var descendantCount = block.getDescendants(false, true).length;
  var nextBlock = block.getNextBlock();
  if (nextBlock) {
    // Blocks in the current stack would survive this block's deletion.
    descendantCount -= nextBlock.getDescendants(false, true).length;
  }

  // Disable collapsing for procedures definition.
  var enabled = block.type !== Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE;

  if (block.isCollapsed()) {
    var expandOption = {
      text: descendantCount == 1 ? Blockly.Msg.EXPAND_BLOCK :
          Blockly.Msg.EXPAND_X_BLOCKS.replace('%1', String(descendantCount)),
      enabled,
      callback: function() {
        block.setCollapsed(false);
        // uncollapse any blocks in branches
        var blocks = block.getDescendants(false, true);
        var badBlocks = nextBlock ? nextBlock.getDescendants(false, true) : [];
        blocks.filter(v => !badBlocks.includes(v)).forEach(v => v.setCollapsed(false));
      }
    };
    return expandOption;
  } else {
    var collapseOption = {
      text: descendantCount == 1 ? Blockly.Msg.COLLAPSE_BLOCK :
          Blockly.Msg.COLLAPSE_X_BLOCKS.replace('%1', String(descendantCount)),
      enabled,
      callback: function() {
        block.setCollapsed(true);
      }
    };
    return collapseOption;
  }
};

/**
 * Make a context menu option for showing help for the current block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockHelpOption = function(block) {
  var url = goog.isFunction(block.helpUrl) ? block.helpUrl() : block.helpUrl;
  var helpOption = {
    enabled: !!url,
    text: Blockly.Msg.HELP,
    callback: function() {
      block.showHelp_();
    }
  };
  return helpOption;
};

/**
 * Make a context menu option for duplicating the current block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @param {!Event} event Event that caused the context menu to open.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockDuplicateOption = function(block, event) {
  var duplicateOption = {
    text: Blockly.Msg.DUPLICATE,
    enabled: true,
    callback:
        Blockly.scratchBlocksUtils.duplicateAndDragCallback(block, event)
  };
  return duplicateOption;
};

/**
 * Make a context menu option for adding or removing comments on the current
 * block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockCommentOption = function(block) {
  var commentOption = {
    enabled: !goog.userAgent.IE
  };
  // If there's already a comment, add an option to delete it.
  if (block.comment) {
    commentOption.text = Blockly.Msg.REMOVE_COMMENT;
    commentOption.callback = function() {
      block.setCommentText(null);
    };
  } else {
    // If there's no comment, add an option to create a comment.
    commentOption.text = Blockly.Msg.ADD_COMMENT;
    commentOption.callback = function() {
      block.setCommentText('');
      block.comment.focus();
    };
  }
  return commentOption;
};

/**
 * Make a context menu option for making space for the block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockMakeSpaceOption = function(block) {
  var makeSpaceOption = {
    text: Blockly.Msg.MAKE_SPACE,
    enabled: true,
    callback: function() {
      if (block && block.workspace) {
        Blockly.Events.setGroup(true);
        block.workspace.cleanUp(block);
        Blockly.Events.setGroup(false);
      }
    }
  };
  return makeSpaceOption;
};

/**
 * Make a context menu option for inspecting the current block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockInspectOption = function(block) {
  var inspectOption = {
    text: Blockly.Msg.INSPECT_BLOCK,
    enabled: true,
    callback: function() {
      if (Blockly.inspectBlockCallback) {
        Blockly.inspectBlockCallback(block);
      }
    },
    separator: true
  };
  return inspectOption;
};

/**
 * Make a context-menu option which fits a new group around this block stack.
 * @param {!Blockly.BlockSvg} block Block where the menu originated.
 * @return {!Object} Context-menu option.
 */
Blockly.ContextMenu.blockGroupOption = function(block) {
  var root = block.getRootBlock();
  var workspace = block.workspace;
  return {
    text: 'Add Group',
    enabled: !workspace.getGroupForBlock(root.id),
    callback: function() {
      var bounds = root.getBoundingRectangle();
      var padding = 16;
      var headerHeight = 32;
      Blockly.Group.fromJSON(workspace, {
        title: 'Group',
        x: bounds.topLeft.x - padding,
        y: bounds.topLeft.y - headerHeight - padding,
        width: bounds.bottomRight.x - bounds.topLeft.x + padding * 2,
        height: bounds.bottomRight.y - bounds.topLeft.y +
            headerHeight + padding * 2,
        blocks: [root.id]
      }, true);
    }
  };
};

/**
 * Make a context menu option for undoing the most recent action on the
 * workspace.
 * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
 *     originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.wsUndoOption = function(ws) {
  return {
    text: Blockly.Msg.UNDO,
    enabled: ws.hasUndoStack(),
    callback: ws.undo.bind(ws, false)
  };
};

/**
 * Make a context menu option for redoing the most recent action on the
 * workspace.
 * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
 *     originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.wsRedoOption = function(ws) {
  return {
    text: Blockly.Msg.REDO,
    enabled: ws.hasRedoStack(),
    callback: ws.undo.bind(ws, true)
  };
};

/**
 * Make a context menu option for cleaning up blocks on the workspace, by
 * aligning them vertically.
 * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
 *     originated.
 * @param {number} numTopBlocks The number of top blocks on the workspace.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.wsCleanupOption = function(ws, numTopBlocks) {
  return {
    text: Blockly.Msg.CLEAN_UP,
    enabled: numTopBlocks > 1,
    callback: ws.cleanUp.bind(ws, true)
  };
};

/**
 * Helper function for toggling delete state on blocks on the workspace, to be
 * called from a right-click menu.
 * @param {!Array.<!Blockly.BlockSvg>} topBlocks The list of top blocks on the
 *     the workspace.
 * @param {boolean} shouldCollapse True if the blocks should be collapsed, false
 *     if they should be expanded.
 * @private
 */
Blockly.ContextMenu.toggleCollapseFn_ = function(topBlocks, shouldCollapse) {
  // Add a little animation to collapsing and expanding.
  var DELAY = 10;
  var ms = 0;
  for (var i = 0; i < topBlocks.length; i++) {
    var block = topBlocks[i];
    while (block) {
      setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms);
      block = block.getNextBlock();
      ms += DELAY;
    }
  }
};

/**
 * Make a context menu option for collapsing all block stacks on the workspace.
 * @param {boolean} hasExpandedBlocks Whether there are any non-collapsed blocks
 *     on the workspace.
 * @param {!Array.<!Blockly.BlockSvg>} topBlocks The list of top blocks on the
 *     the workspace.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.wsCollapseOption = function(hasExpandedBlocks, topBlocks) {
  return {
    enabled: hasExpandedBlocks,
    text: Blockly.Msg.COLLAPSE_ALL,
    callback: function() {
      Blockly.ContextMenu.toggleCollapseFn_(topBlocks, true);
    }
  };
};

/**
 * Make a context menu option for expanding all block stacks on the workspace.
 * @param {boolean} hasCollapsedBlocks Whether there are any collapsed blocks
 *     on the workspace.
 * @param {!Array.<!Blockly.BlockSvg>} topBlocks The list of top blocks on the
 *     the workspace.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.wsExpandOption = function(hasCollapsedBlocks, topBlocks) {
  return {
    enabled: hasCollapsedBlocks,
    text: Blockly.Msg.EXPAND_ALL,
    callback: function() {
      Blockly.ContextMenu.toggleCollapseFn_(topBlocks, false);
    }
  };
};

/**
 * Make a context menu option for deleting the current workspace comment.
 * @param {!Blockly.WorkspaceCommentSvg} comment The workspace comment where the
 *     right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.commentDeleteOption = function(comment) {
  var deleteOption = {
    text: Blockly.Msg.DELETE,
    enabled: true,
    callback: function() {
      Blockly.Events.setGroup(true);
      comment.dispose(true, true);
      Blockly.Events.setGroup(false);
    }
  };
  return deleteOption;
};

/**
 * Make a context menu option for duplicating the current workspace comment.
 * @param {!Blockly.WorkspaceCommentSvg} comment The workspace comment where the
 *     right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.commentDuplicateOption = function(comment) {
  var duplicateOption = {
    text: Blockly.Msg.DUPLICATE,
    enabled: true,
    callback: function() {
      Blockly.duplicate_(comment);
    }
  };
  return duplicateOption;
};

/**
 * Make a context menu option for adding a comment on the workspace.
 * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
 * originated.
 * @param {!Event} e The right-click mouse event.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.workspaceCommentOption = function(ws, e) {
  // Helper function to create and position a comment correctly based on the
  // location of the mouse event.
  var addWsComment = function() {
    // Disable events while this comment is getting created
    // so that we can fire a single create event for this comment
    // at the end (instead of CommentCreate followed by CommentMove,
    // which results in unexpected undo behavior).
    var disabled = false;
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.disable();
      disabled = true;
    }
    var comment = new Blockly.WorkspaceCommentSvg(
        ws, '', Blockly.WorkspaceCommentSvg.DEFAULT_SIZE,
        Blockly.WorkspaceCommentSvg.DEFAULT_SIZE, false);

    var injectionDiv = ws.getInjectionDiv();
    // Bounding rect coordinates are in client coordinates, meaning that they
    // are in pixels relative to the upper left corner of the visible browser
    // window.  These coordinates change when you scroll the browser window.
    var boundingRect = injectionDiv.getBoundingClientRect();

    // The client coordinates offset by the injection div's upper left corner.
    var clientOffsetPixels = new goog.math.Coordinate(
        e.clientX - boundingRect.left, e.clientY - boundingRect.top);

    // The offset in pixels between the main workspace's origin and the upper
    // left corner of the injection div.
    var mainOffsetPixels = ws.getOriginOffsetInPixels();

    // The position of the new comment in pixels relative to the origin of the
    // main workspace.
    var finalOffsetPixels = goog.math.Coordinate.difference(clientOffsetPixels,
        mainOffsetPixels);

    // The position of the new comment in main workspace coordinates.
    var finalOffsetMainWs = finalOffsetPixels.scale(1 / ws.scale);

    var commentX = finalOffsetMainWs.x;
    var commentY = finalOffsetMainWs.y;
    comment.moveBy(commentX, commentY);
    if (ws.rendered) {
      comment.initSvg();
      comment.render(false);
      comment.select();
    }
    if (disabled) {
      Blockly.Events.enable();
    }
    Blockly.WorkspaceComment.fireCreateEvent(comment);
  };

  var wsCommentOption = {enabled: true};
  wsCommentOption.text = Blockly.Msg.ADD_COMMENT;
  wsCommentOption.callback = function() {
    addWsComment();
  };
  return wsCommentOption;
};

/**
 * Make a context-menu option for duplicating a group and its blocks.
 * @param {!Blockly.Group} group Group to duplicate.
 * @param {!Event} event Event that opened the context menu.
 * @return {!Object} Context-menu option.
 */
Blockly.ContextMenu.groupDuplicateOption = function(group, event) {
  return {
    text: Blockly.Msg.DUPLICATE,
    enabled: true,
    callback: function(e) {
      // Let the menu's mouse-up finish before starting the synthetic drag.
      setTimeout(function() {
        group.duplicateGroup_(e, event);
      }, 0);
    }
  };
};

/**
 * Make a context-menu option for renaming a group.
 * @param {!Blockly.Group} group Group to rename.
 * @return {!Object} Context-menu option.
 */
Blockly.ContextMenu.groupRenameOption = function(group) {
  return {
    text: Blockly.Msg.RENAME || 'Rename',
    enabled: true,
    callback: function() {
      group.rename_({stopPropagation: function() {}});
    }
  };
};

/**
 * Make a context-menu option for deleting a group without deleting its blocks.
 * @param {!Blockly.Group} group Group to delete.
 * @return {!Object} Context-menu option.
 */
Blockly.ContextMenu.groupDeleteOption = function(group) {
  return {
    text: Blockly.Msg.DELETE,
    enabled: true,
    callback: function() {
      group.dispose(true);
    }
  };
};

/**
 * @param {!Blockly.WorkspaceSvg} ws Target workspace.
 * @param {!Event} e Context-menu event.
 * @return {!Object} Context-menu entry for creating a group.
 */
Blockly.ContextMenu.workspaceGroupOption = function(ws, e) {
  return {text: 'Add Group', enabled: true, callback: function() {
    var rect = ws.getInjectionDiv().getBoundingClientRect();
    var point = new goog.math.Coordinate(e.clientX - rect.left,
        e.clientY - rect.top);
    var position = goog.math.Coordinate.difference(
        point, ws.getOriginOffsetInPixels()).scale(1 / ws.scale);
    Blockly.Group.fromJSON(ws, {title: 'Group', x: position.x,
      y: position.y, width: 360, height: 240}, true);
  }};
};

/**
 * Make context menu option for removing all blocks that are orphans
 *     (output and no parent connection)
 * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
 *     originated.
 * @param {!number} orphanCount Amount of orphan blocks.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.workspaceDeleteOrphansOption = function(ws, orphanCount) {
  var deleteOrphans = function() {
    Blockly.Events.setGroup(true);

    var blocks = ws.getTopBlocks(true);
    blocks.forEach(function(block) {
      if (!!block.outputConnection && !block.parentBlock_) {
        block.dispose();
      }
    });

    Blockly.Events.setGroup(false);
  };

  var wsDeleteOrphansOption = {enabled: orphanCount > 0};
  wsDeleteOrphansOption.text = orphanCount == 1
      ? Blockly.Msg.DELETE_ORPHANS
      : Blockly.Msg.DELETE_X_ORPHANS.replace('%1', String(orphanCount));
  wsDeleteOrphansOption.callback = function() {
    if (orphanCount < 2 ) {
      deleteOrphans();
    } else {
      Blockly.confirm(
          Blockly.Msg.DELETE_ALL_ORPHANS.replace('%1', String(orphanCount)),
          function(ok) {
            if (ok) {
              deleteOrphans();
            }
          });
    }
  };
  return wsDeleteOrphansOption;
};

/**
 * Make context menu option for removing all unused local variables and lists.
 * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
 *     originated.
 * @param {!number} varCount Amount of unused local variables.
 * @param {!number} listCount Amount of unused local lists.
 * @param {!number} tableCount Amount of unused local tables.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.workspaceCleanupUnusedVarsOption = function(ws, varCount, listCount, tableCount) {
  var deleteUnused = function() {
    Blockly.Events.setGroup(true);

    var map = ws.getVariableMap();
    var vars = map.getVariablesOfType('');
    for (var i = 0; i < vars.length; i++) {
      if (vars[i].isLocal) {
        var usages = map.getVariableUsesById(vars[i].getId());
        if (!usages || usages.length === 0) {
          ws.deleteVariableById(vars[i].getId());
        }
      }
    }

    var lists = map.getVariablesOfType(Blockly.LIST_VARIABLE_TYPE);
    for (var i = 0; i < lists.length; i++) {
      if (lists[i].isLocal) {
        var usages = map.getVariableUsesById(lists[i].getId());
        if (!usages || usages.length === 0) {
          ws.deleteVariableById(lists[i].getId());
        }
      }
    }

    var tables = map.getVariablesOfType(Blockly.TABLE_VARIABLE_TYPE);
    for (var i = 0; i < tables.length; i++) {
      if (tables[i].isLocal) {
        var usages = map.getVariableUsesById(tables[i].getId());
        if (!usages || usages.length === 0) {
          ws.deleteVariableById(tables[i].getId());
        }
      }
    }

    Blockly.Events.setGroup(false);
  };

  var total = varCount + listCount;
  var wsCleanupOption = {enabled: total > 0};
  wsCleanupOption.text = (total == 1)
      ? Blockly.Msg.DELETE_UNUSED_VAR
      : Blockly.Msg.DELETE_UNUSED_VARS;
  wsCleanupOption.callback = function() {
    if (total < 2) {
      deleteUnused();
    } else {
      var message = tableCount === 0
        ? Blockly.Msg.DELETE_ALL_UNUSED_VARS.replace('%1', String(varCount)).replace('%2', String(listCount))
        : Blockly.Msg.DELETE_ALL_UNUSED_TABLES
            .replace('%1', String(varCount)).replace('%2', String(listCount)).replace('%3', String(tableCount));

      Blockly.confirm(
          message,
          function(ok) {
            if (ok) {
              deleteUnused();
            }
          });
    }
  };
  return wsCleanupOption;
};

Blockly.ContextMenu.prettyNameCache = {};

/**
 * Make context menu options for switching this block to another type.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Array.<!Object>} An array of menu options for each switch target.
 * @package
 */
Blockly.ContextMenu.blockSwitchOption = function(block) {
  var switches = block.getSwitches();

  if (!switches || switches.length === 0) {
    return [];
  }

  var options = [];

  function maybePretty(id) {
    if (Blockly.ContextMenu.prettyNameCache[id]) {
      return Blockly.ContextMenu.prettyNameCache[id];
    }

    const blockDef = Blockly.Blocks[id];
    if (!blockDef) {
      return id.split("_").slice(1).join(" ");
    }

    let prettyText = '';
    let tempWorkspace = null;
    let tempBlock = null;

    try {
      tempWorkspace = new Blockly.Workspace();
      tempBlock = tempWorkspace.newBlock(id);
      if (tempBlock) {
        prettyText = tempBlock.toString(
            50 /*opt_maxLength*/,
            null /*opt_emptyToken*/,
            false /*opt_showImageAlts*/
        );
      }
    } catch (err) {
      console.warn(`Could not resolve block text for: ${id}`, err);
    } finally {
      if (tempBlock) tempBlock.dispose(false);
      if (tempWorkspace) tempWorkspace.dispose();
    }

    const result = prettyText || id.split("_").slice(1).join(" ");
    Blockly.ContextMenu.prettyNameCache[id] = result;
    return result;
  }

  function getShadowFieldName(shadowType) {
    if (shadowType === "text") return "TEXT";
    if (shadowType === "colour_picker") return "COLOUR";
    return "NUM";
  }

  function callIfFunction(value) {
    return typeof value === "function" ? value() : value;
  }

  switches.forEach(function(switchData) {
    var opcodeData = (typeof switchData === 'string') ? { opcode: switchData } : switchData;
    var targetType = opcodeData.opcode || opcodeData.id;

    if (targetType === block.type) return;

    var remapInputName = opcodeData.remapInputName || {};
    if (Array.isArray(opcodeData.inputs)) {
      remapInputName = {};
      opcodeData.inputs.forEach(function(pair) {
        remapInputName[pair[0]] = pair[1];
      });
    }

    options.push({
      text: Blockly.Msg.SWITCH_BLOCK.replace('%1', maybePretty(targetType)),
      enabled: true,
      separator: options.length === 0,
      callback: function() {
        if (opcodeData.isNoop) return;

        Blockly.Events.setGroup(true);
        var workspace = block.workspace;

        // Save the parent connection and next connection so they can be re-connected afterwards.
        var parentConnection = null;
        if (block.previousConnection && block.previousConnection.isConnected()) {
          parentConnection = block.previousConnection.targetConnection;
          block.previousConnection.disconnect();
        } else if (block.outputConnection && block.outputConnection.isConnected()) {
          parentConnection = block.outputConnection.targetConnection;
          block.outputConnection.disconnect();
        }

        var nextConnection = null;
        if (block.nextConnection && block.nextConnection.isConnected()) {
          nextConnection = block.nextConnection.targetConnection;
          block.nextConnection.disconnect();
        }

        if (opcodeData.splitInputs) {
          opcodeData.splitInputs.forEach(function(inputName) {
            var input = block.getInput(inputName);
            if (!input || !input.connection) return;
            var target = input.connection.targetBlock();
            if (target && !target.isShadow()) {
              input.connection.disconnect();
              var metrics = block.getHeightWidth();
              target.moveBy(4, metrics.height);
            }
          });
        }

        var xml = Blockly.Xml.blockToDom(block);
        var position = block.getRelativeToSurfaceXY();

        xml.setAttribute("x", position.x);
        xml.setAttribute("y", position.y);
        if (targetType) xml.setAttribute("type", targetType);

        for (const child of Array.from(xml.children)) {
          const oldName = child.getAttribute("name");
          if (opcodeData.splitInputs && opcodeData.splitInputs.includes(oldName)) {
            xml.removeChild(child);
            continue;
          }
          if (remapInputName[oldName]) {
            child.setAttribute("name", remapInputName[oldName]);
          }
          if (opcodeData.remapShadowType && opcodeData.remapShadowType[oldName]) {
            const valueNode = child.firstChild;
            const fieldNode = valueNode.firstChild;
            valueNode.setAttribute("type", opcodeData.remapShadowType[oldName]);
            fieldNode.setAttribute("name", getShadowFieldName(opcodeData.remapShadowType[oldName]));
          }
          if (opcodeData.mapFieldValues && opcodeData.mapFieldValues[oldName] && child.tagName === "FIELD") {
            const newValue = opcodeData.mapFieldValues[oldName][child.innerText];
            if (typeof newValue === "string") child.innerText = newValue;
          }
        }

        if (opcodeData.mutate) {
          const mutation = xml.querySelector("mutation");
          for (const [key, value] of Object.entries(opcodeData.mutate)) {
            mutation.setAttribute(key, value);
          }
        }

        if (opcodeData.createInputs) {
          for (const [inputName, inputData] of Object.entries(opcodeData.createInputs)) {
            const valueElement = document.createElement("value");
            valueElement.setAttribute("name", inputName);
            const shadowElement = document.createElement("shadow");
            shadowElement.setAttribute("type", inputData.shadowType);
            const shadowFieldElement = document.createElement("field");
            shadowFieldElement.setAttribute("name", getShadowFieldName(inputData.shadowType));
            shadowFieldElement.innerText = callIfFunction(inputData.value);
            shadowElement.appendChild(shadowFieldElement);
            valueElement.appendChild(shadowElement);
            xml.appendChild(valueElement);
          }
        }

        block.dispose();
        var newBlock = Blockly.Xml.domToBlock(xml, workspace);
        newBlock.moveBy(position.x, position.y);

        // Reconnect back to the parent chain.
        if (parentConnection) {
          try {
            if (newBlock.previousConnection) {
              newBlock.previousConnection.connect(parentConnection);
            } else if (newBlock.outputConnection) {
              newBlock.outputConnection.connect(parentConnection);
            }
          } catch (e) {
            console.warn("Failed to reconnect swapped block to its parent:", e);
          }
        }

        // Reconnect to the next block chain.
        if (nextConnection && newBlock.nextConnection) {
          try {
            newBlock.nextConnection.connect(nextConnection);
          } catch (e) {
            console.warn("Failed to reconnect swapped block to the next block:", e);
          }
        }

        Blockly.Events.setGroup(false);
        if (Blockly.Events.isEnabled()) {
          Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
        }
        newBlock.select();
      }
    });
  });

  return options;
};

// End helper functions for creating context menu options.
