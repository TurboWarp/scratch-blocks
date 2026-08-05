/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Procedures
 * @namespace
 **/
goog.provide('Blockly.Procedures');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');


/**
 * Constant to separate procedure names from variables and generated functions
 * when running generators.
 * @deprecated Use Blockly.PROCEDURE_CATEGORY_NAME
 */
Blockly.Procedures.NAME_TYPE = Blockly.PROCEDURE_CATEGORY_NAME;

/**
 * Find all user-created procedure definitions in a workspace.
 * @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array.<!Array.<!Array>>} Pair of arrays, the
 *     first contains procedures without return variables, the second with.
 *     Each procedure is defined by a three-element list of name, parameter
 *     list, and return value boolean.
 */
Blockly.Procedures.allProcedures = function(root) {
  var blocks = root.getAllBlocks();
  var proceduresReturn = [];
  var proceduresNoReturn = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getProcedureDef) {
      var tuple = blocks[i].getProcedureDef();
      if (tuple) {
        if (tuple[2]) {
          proceduresReturn.push(tuple);
        } else {
          proceduresNoReturn.push(tuple);
        }
      }
    }
  }
  proceduresNoReturn.sort(Blockly.Procedures.procTupleComparator_);
  proceduresReturn.sort(Blockly.Procedures.procTupleComparator_);
  return [proceduresNoReturn, proceduresReturn];
};

/**
 * Find all user-created procedure definition mutations in a workspace.
 * @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array.<Element>} Array of mutation xml elements.
 * @package
 */
Blockly.Procedures.allProcedureMutations = function(root) {
  var blocks = root.getAllBlocks();
  var mutations = [];
  var localByProcCode = Object.create(null);

  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type == Blockly.PROCEDURES_PROTOTYPE_BLOCK_TYPE) {
      var mutation = blocks[i].mutationToDom(/* opt_generateShadows */ true);
      if (mutation) {
        var localProcCode = mutation.getAttribute('proccode');
        if (localProcCode) {
          localByProcCode[localProcCode] = true;
        }
        mutations.push(mutation);
      }
    }
  }

  if (root.getAllGlobalProcedureMutations) {
    var globalMutations = root.getAllGlobalProcedureMutations();
    for (var j = 0; j < globalMutations.length; j++) {
      var globalMutation = globalMutations[j];
      if (!globalMutation) {
        continue;
      }
      var globalProcCode = globalMutation.getAttribute('proccode');
      // The live workspace is authoritative for its own definitions. The VM
      // may still contain the pre-edit snapshot while workspace events settle.
      if (globalProcCode && localByProcCode[globalProcCode]) {
        continue;
      }
      mutations.push(globalMutation);
    }
  }
  return mutations;
};

/**
 * Sorts an array of procedure definition mutations alphabetically.
 * (Does not mutate the given array.)
 * @param {!Array.<Element>} mutations Array of mutation xml elements.
 * @return {!Array.<Element>} Sorted array of mutation xml elements.
 * @private
 */
Blockly.Procedures.sortProcedureMutations_ = function(mutations) {
  var newMutations = mutations.slice();

  newMutations.sort(function(a, b) {
    var procCodeA = a.getAttribute('proccode');
    var procCodeB = b.getAttribute('proccode');

    return Blockly.scratchBlocksUtils.compareStrings(procCodeA, procCodeB);
  });

  return newMutations;
};

/**
 * Comparison function for case-insensitive sorting of the first element of
 * a tuple.
 * @param {!Array} ta First tuple.
 * @param {!Array} tb Second tuple.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 * @private
 */
Blockly.Procedures.procTupleComparator_ = function(ta, tb) {
  return Blockly.scratchBlocksUtils.compareStrings(ta[0], tb[0]);
};

/**
 * Ensure two identically-named procedures don't exist.
 * @param {string} name Proposed procedure name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Procedures.findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple procedures called 'do something'.
    return name;
  }
  while (!Blockly.Procedures.isLegalName_(name, block.workspace, block)) {
    // Collision with another procedure.
    var r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += '2';
    } else {
      name = r[1] + (parseInt(r[2], 10) + 1);
    }
  }
  return name;
};

/**
 * Does this procedure have a legal name?  Illegal names include names of
 * procedures already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 * @private
 */
Blockly.Procedures.isLegalName_ = function(name, workspace, opt_exclude) {
  return !Blockly.Procedures.isNameUsed(name, workspace, opt_exclude);
};

/**
 * Return if the given name is already a procedure name.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is used, otherwise return false.
 */
Blockly.Procedures.isNameUsed = function(name, workspace, opt_exclude) {
  var blocks = workspace.getAllBlocks();
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i] == opt_exclude) {
      continue;
    }
    if (blocks[i].getProcedureDef) {
      var procName = blocks[i].getProcedureDef();
      if (Blockly.Names.equals(procName[0], name)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Rename a procedure.  Called by the editable field.
 * @param {string} name The proposed new name.
 * @return {string} The accepted name.
 * @this {Blockly.Field}
 */
Blockly.Procedures.rename = function(name) {
  // Strip leading and trailing whitespace.  Beyond this, all names are legal.
  name = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');

  // Ensure two identically-named procedures don't exist.
  var legalName = Blockly.Procedures.findLegalName(name, this.sourceBlock_);
  var oldName = this.text_;
  if (oldName != name && oldName != legalName) {
    // Rename any callers.
    var blocks = this.sourceBlock_.workspace.getAllBlocks();
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].renameProcedure) {
        blocks[i].renameProcedure(oldName, legalName);
      }
    }
  }
  return legalName;
};

/**
 * Check whether a mutation is globally scoped.
 * @param {?Element} mutation Procedure mutation XML.
 * @return {boolean} True when global="true".
 * @private
 */
Blockly.Procedures.isGlobalMutation_ = function(mutation) {
  return !!(mutation && mutation.getAttribute('global') === 'true');
};

/**
 * Return whether creating a procedure with this mutation would conflict.
 * Rules:
 * - local procedures conflict only with existing local procedures in this workspace.
 * - global procedures conflict with any procedure layout (local/global) in any sprite.
 * @param {!Element} mutation Procedure mutation XML.
 * @param {!Blockly.Workspace} workspace Current workspace.
 * @param {Blockly.Block=} opt_blockToIgnore Existing prototype being edited.
 * @return {boolean} True if conflict exists.
 * @private
 */
Blockly.Procedures.hasProcedureLayoutConflict_ = function(
    mutation, workspace, opt_blockToIgnore) {
  var procCode = mutation.getAttribute('proccode');
  if (!procCode) {
    return false;
  }

  var isGlobal = Blockly.Procedures.isGlobalMutation_(mutation);
  var blocks = workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block === opt_blockToIgnore) {
      continue;
    }
    if (block.type !== Blockly.PROCEDURES_PROTOTYPE_BLOCK_TYPE || !block.getProcCode) {
      continue;
    }
    if (block.getProcCode() !== procCode) {
      continue;
    }

    if (!isGlobal) {
      // Local creation only conflicts with existing local procedures.
      if (!block.getGlobal || !block.getGlobal()) {
        return true;
      }
      continue;
    }

    // Global creation conflicts with any matching local/global procedure.
    return true;
  }

  // Cross-target checks:
  // - local creation conflicts with existing globals in any target.
  // - global creation conflicts with any matching local/global in any target.
  var vm = workspace.vm;
  var runtime = vm && vm.runtime;
  if (!runtime || !runtime.targets) {
    return false;
  }

  for (var t = 0; t < runtime.targets.length; t++) {
    var target = runtime.targets[t];
    if (!target || !target.isOriginal || !target.blocks || !target.blocks._blocks) {
      continue;
    }

    var targetBlocks = target.blocks._blocks;
    for (var blockId in targetBlocks) {
      if (!Object.prototype.hasOwnProperty.call(targetBlocks, blockId)) continue;
      if (opt_blockToIgnore && blockId === opt_blockToIgnore.id) continue;
      var targetBlock = targetBlocks[blockId];
      if (!targetBlock || targetBlock.opcode !== 'procedures_prototype' || !targetBlock.mutation) {
        continue;
      }
      if (targetBlock.mutation.proccode !== procCode) {
        continue;
      }

      var targetIsGlobal = targetBlock.mutation.global === true ||
          targetBlock.mutation.global === 'true';
      if (!isGlobal && !targetIsGlobal) {
        // Local creation does not conflict with other targets' local procedures.
        continue;
      }
      return true;
    }
  }

  return false;
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Blockly.Workspace} workspace The workspace contianing procedures.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Procedures.flyoutCategory = function(workspace) {
  var xmlList = [];

  Blockly.Procedures.addCreateButton_(workspace, xmlList);

  var setParamBlock = goog.dom.createDom('block');
  setParamBlock.setAttribute('type', Blockly.PROCEDURES_SET_PARAM_BLOCK_TYPE);
  setParamBlock.setAttribute('gap', 12);
  var setParamBlockValue = goog.dom.createDom('value');
  setParamBlockValue.setAttribute('name', 'VALUE');
  var setParamBlockShadow = goog.dom.createDom('shadow');
  setParamBlockShadow.setAttribute('type', 'text');
  var setParamBlockField = goog.dom.createDom('field');
  setParamBlockField.setAttribute('name', 'TEXT');
  setParamBlockShadow.appendChild(setParamBlockField);
  setParamBlockValue.appendChild(setParamBlockShadow);
  setParamBlock.appendChild(setParamBlockValue);
  xmlList.push(setParamBlock);

  var returnBlock = goog.dom.createDom('block');
  returnBlock.setAttribute('type', Blockly.PROCEDURES_RETURN_BLOCK_TYPE);
  returnBlock.setAttribute('gap', 12);
  var returnBlockValue = goog.dom.createDom('value');
  returnBlockValue.setAttribute('name', 'VALUE');
  var returnBlockShadow = goog.dom.createDom('shadow');
  returnBlockShadow.setAttribute('type', 'text');
  var returnBlockField = goog.dom.createDom('field');
  returnBlockField.setAttribute('name', 'TEXT');
  returnBlockShadow.appendChild(returnBlockField);
  returnBlockValue.appendChild(returnBlockShadow);
  returnBlock.appendChild(returnBlockValue);
  xmlList.push(returnBlock);

  xmlList.push(Blockly.Xml.textToDom('<xml><sep gap="24"/></xml>').firstChild);

  // Create call blocks for each procedure defined in the workspace
  var mutations = Blockly.Procedures.allProcedureMutations(workspace);
  mutations = Blockly.Procedures.sortProcedureMutations_(mutations);
  for (var i = 0; i < mutations.length; i++) {
    var mutation = mutations[i].cloneNode(false);
    var procCode = mutation.getAttribute('proccode');
    var returnType = Blockly.Procedures.getProcedureReturnType(procCode, workspace);
    if (returnType !== Blockly.PROCEDURES_CALL_TYPE_STATEMENT) {
      mutation.setAttribute('return', returnType);
    }
    // <block type="procedures_call">
    //   <mutation ...></mutation>
    // </block>
    var block = goog.dom.createDom('block');
    block.setAttribute('type', 'procedures_call');
    block.setAttribute('gap', 12);
    block.appendChild(mutation);
    xmlList.push(block);
  }

  return xmlList;
};

/**
 * Create the "Make a Block..." button.
 * @param {!Blockly.Workspace} workspace The workspace contianing procedures.
 * @param {!Array.<!Element>} xmlList Array of XML block elements to add to.
 * @private
 */
Blockly.Procedures.addCreateButton_ = function(workspace, xmlList) {
  var button = goog.dom.createDom('button');
  var msg = Blockly.Msg.NEW_PROCEDURE;
  var callbackKey = 'CREATE_PROCEDURE';
  var callback = function() {
    Blockly.Procedures.createProcedureDefCallback_(workspace);
  };
  button.setAttribute('text', msg);
  button.setAttribute('callbackKey', callbackKey);
  workspace.registerButtonCallback(callbackKey, callback);
  xmlList.push(button);
};

/**
 * Find all callers of a named procedure.
 * @param {string} name Name of procedure (procCode in scratch-blocks).
 * @param {!Blockly.Workspace} ws The workspace to find callers in.
 * @param {!Blockly.Block} definitionRoot The root of the stack where the
 *     procedure is defined.
 * @param {boolean} allowRecursive True if the search should include recursive
 *     procedure calls.  False if the search should ignore the stack starting
 *     with definitionRoot.
 * @return {!Array.<!Blockly.Block>} Array of caller blocks.
 * @package
 */
Blockly.Procedures.getCallers = function(name, ws, definitionRoot,
    allowRecursive) {
  var allBlocks = [];
  var topBlocks = ws.getTopBlocks();

  // Start by deciding which stacks to investigate.
  for (var i = 0; i < topBlocks.length; i++) {
    var block = topBlocks[i];
    if (block.id == definitionRoot.id && !allowRecursive) {
      continue;
    }
    allBlocks.push.apply(allBlocks, block.getDescendants(false));
  }

  var callers = [];
  for (var i = 0; i < allBlocks.length; i++) {
    var block = allBlocks[i];
    if (block.type == Blockly.PROCEDURES_CALL_BLOCK_TYPE ) {
      var procCode = block.getProcCode();
      if (procCode && procCode == name) {
        callers.push(block);
      }
    }
  }
  return callers;
};

/**
 * Find and edit all callers with a procCode using a new mutation.
 * @param {string} name Name of procedure (procCode in scratch-blocks).
 * @param {!Blockly.Workspace} ws The workspace to find callers in.
 * @param {!Element} mutation New mutation for the callers.
 * @package
 */
Blockly.Procedures.mutateCallersAndPrototype = function(name, ws, mutation) {
  var defineBlock = Blockly.Procedures.getDefineBlock(name, ws);
  var prototypeBlock = Blockly.Procedures.getPrototypeBlock(name, ws);
  if (defineBlock && prototypeBlock) {
    var callers = Blockly.Procedures.getCallers(name,
        defineBlock.workspace, defineBlock, true /* allowRecursive */);
    callers.push(prototypeBlock);
    Blockly.Events.setGroup(true);
    for (var i = 0, caller; caller = callers[i]; i++) {
      var oldMutationDom = caller.mutationToDom();
      var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

      // Preserve the block's existing shape
      var mutationToReplaceWith = mutation.cloneNode(false);
      mutationToReplaceWith.setAttribute('return', oldMutationDom.getAttribute('return'));
      caller.domToMutation(mutationToReplaceWith);

      var newMutationDom = caller.mutationToDom();
      var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
      if (oldMutation != newMutation) {
        Blockly.Events.fire(new Blockly.Events.BlockChange(
            caller, 'mutation', null, oldMutation, newMutation));
      }
    }
    Blockly.Events.setGroup(false);
  } else {
    alert('No define block on workspace'); // TODO decide what to do about this.
  }
};

/**
 * Find the definition block for the named procedure.
 * @param {string} procCode The identifier of the procedure.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {Blockly.Block} The procedure definition block, or null not found.
 * @package
 */
Blockly.Procedures.getDefineBlock = function(procCode, workspace) {
  // Assume that a procedure definition is a top block.
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type == Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE) {
      var prototypeBlock = blocks[i].getInput('custom_block').connection.targetBlock();
      if (prototypeBlock.getProcCode && prototypeBlock.getProcCode() == procCode) {
        return blocks[i];
      }
    }
  }
  return null;
};

/**
 * Find the prototype block for the named procedure.
 * @param {string} procCode The identifier of the procedure.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {Blockly.Block} The procedure prototype block, or null not found.
 * @package
 */
Blockly.Procedures.getPrototypeBlock = function(procCode, workspace) {
  var defineBlock = Blockly.Procedures.getDefineBlock(procCode, workspace);
  if (defineBlock) {
    return defineBlock.getInput('custom_block').connection.targetBlock();
  }
  return null;
};

/**
 * Create a mutation for a brand new custom procedure.
 * @return {Element} The mutation for a new custom procedure
 * @package
 */
Blockly.Procedures.newProcedureMutation = function() {
  var mutationText = '<xml>' +
      '<mutation' +
      ' proccode="' + Blockly.Msg['PROCEDURE_DEFAULT_NAME'] + '"' +
      ' argumentids="[]"' +
      ' argumentnames="[]"' +
      ' argumentdefaults="[]"' +
      ' argumentdropdowns="[]"' +
      ' warp="false"' +
      ' global="false">' +
      '</mutation>' +
      '</xml>';
  return Blockly.Xml.textToDom(mutationText).firstChild;
};

/**
 * Callback to create a new procedure custom command block.
 * @param {!Blockly.Workspace} workspace The workspace to create the new procedure on.
 * @private
 */
Blockly.Procedures.createProcedureDefCallback_ = function(workspace) {
  Blockly.Procedures.externalProcedureDefCallback(
      Blockly.Procedures.newProcedureMutation(),
      Blockly.Procedures.createProcedureCallbackFactory_(workspace)
  );
};

/**
 * Callback factory for adding a new custom procedure from a mutation.
 * @param {!Blockly.Workspace} workspace The workspace to create the new procedure on.
 * @return {function(?Element)} callback for creating the new custom procedure.
 * @private
 */
Blockly.Procedures.createProcedureCallbackFactory_ = function(workspace) {
  return function(mutation) {
    if (mutation) {
      if (Blockly.Procedures.hasProcedureLayoutConflict_(mutation, workspace)) {
        alert(Blockly.Msg.PROCEDURE_ALREADY_EXISTS.replace('%1', mutation.getAttribute('proccode')));
        return false;
      }

      var blockText = '<xml>' +
          '<block type="procedures_definition">' +
          '<statement name="custom_block">' +
          '<shadow type="procedures_prototype">' +
          Blockly.Xml.domToText(mutation) +
          '</shadow>' +
          '</statement>' +
          '</block>' +
          '</xml>';
      var blockDom = Blockly.Xml.textToDom(blockText).firstChild;
      Blockly.Events.setGroup(true);
      var block = Blockly.Xml.domToBlock(blockDom, workspace);
      var scale = workspace.scale; // To convert from pixel units to workspace units
      // Position the block so that it is at the top left of the visible workspace,
      // padded from the edge by 30 units. Position in the top right if RTL.
      var posX = -workspace.scrollX;
      if (workspace.RTL) {
        posX += workspace.getMetrics().contentWidth - 30;
      } else {
        posX += 30;
      }
      block.moveBy(posX / scale, (-workspace.scrollY + 30) / scale);
      block.scheduleSnapAndBump();
      Blockly.Events.setGroup(false);
      return true;
    }
  };
};

/**
 * Callback to open the modal for editing custom procedures.
 * @param {!Blockly.Block} block The block that was right-clicked.
 * @private
 */
Blockly.Procedures.editProcedureCallback_ = function(block) {
  // Edit can come from one of three block types (call, define, prototype)
  // Normalize by setting the block to the prototype block for the procedure.
  if (block.type == Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE) {
    var input = block.getInput('custom_block');
    if (!input) {
      alert('Bad input'); // TODO: Decide what to do about this.
      return;
    }
    var conn = input.connection;
    if (!conn) {
      alert('Bad connection'); // TODO: Decide what to do about this.
      return;
    }
    var innerBlock = conn.targetBlock();
    if (!innerBlock ||
        !innerBlock.type == Blockly.PROCEDURES_PROTOTYPE_BLOCK_TYPE) {
      alert('Bad inner block'); // TODO: Decide what to do about this.
      return;
    }
    block = innerBlock;
  } else if (block.type == Blockly.PROCEDURES_CALL_BLOCK_TYPE) {
    // This is a call block, find the prototype corresponding to the procCode.
    // Make sure to search the correct workspace, call block can be in flyout.
    var workspaceToSearch = block.workspace.isFlyout ?
        block.workspace.targetWorkspace : block.workspace;
    block = Blockly.Procedures.getPrototypeBlock(
        block.getProcCode(), workspaceToSearch);
  }
  // Block now refers to the procedure prototype block, it is safe to proceed.
  Blockly.Procedures.externalProcedureDefCallback(
      block.mutationToDom(),
      Blockly.Procedures.editProcedureCallbackFactory_(block)
  );
};

/**
 * Callback factory for editing an existing custom procedure.
 * @param {!Blockly.Block} block The procedure prototype block being edited.
 * @return {function(?Element)} Callback for editing the custom procedure.
 * @private
 */
Blockly.Procedures.editProcedureCallbackFactory_ = function(block) {
  return function(mutation) {
    if (mutation) {
      if (Blockly.Procedures.hasProcedureLayoutConflict_(
          mutation, block.workspace, block)) {
        alert(Blockly.Msg.PROCEDURE_ALREADY_EXISTS.replace(
            '%1', mutation.getAttribute('proccode')));
        return false;
      }

      Blockly.Procedures.mutateCallersAndPrototype(block.getProcCode(),
          block.workspace, mutation);
      return true;
    }
  };
};

/**
 * Callback to create a new procedure custom command block.
 * @public
 */
Blockly.Procedures.externalProcedureDefCallback = function(/** mutator, callback */) {
  alert('External procedure editor must be override Blockly.Procedures.externalProcedureDefCallback');
};

/**
 * Make a context menu option for editing a custom procedure.
 * This appears in the context menu for procedure definitions and procedure
 * calls.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.Procedures.makeEditOption = function(block) {
  var canEdit = true;
  if (block.type == Blockly.PROCEDURES_CALL_BLOCK_TYPE) {
    var workspaceToSearch = block.workspace.isFlyout ?
        block.workspace.targetWorkspace : block.workspace;
    canEdit = !!Blockly.Procedures.getPrototypeBlock(block.getProcCode(), workspaceToSearch);
  }
  var editOption = {
    enabled: canEdit,
    text: Blockly.Msg.EDIT_PROCEDURE,
    callback: function() {
      Blockly.Procedures.editProcedureCallback_(block);
    }
  };
  return editOption;
};

Blockly.Procedures.makeChangeTypeOption = function(block) {
  var isStatement = block.getReturn() === Blockly.PROCEDURES_CALL_TYPE_STATEMENT;
  var option = {
    enabled: true,
    text: isStatement ? Blockly.Msg.PROCEDURES_TO_REPORTER : Blockly.Msg.PROCEDURES_TO_STATEMENT,
    callback: function() {
      var newType;
      if (isStatement) {
        var procCode = block.getProcCode();
        var workspace = block.workspace;
        var actualReturnType = Blockly.Procedures.getProcedureReturnType(procCode, workspace);
        // If the definition is object-shaped, then the reporter should be object-shaped,
        // else if the definition is boolean-shaped, then the reporter should be boolean-shaped,
        // otherwise normal reporter shaped.
        newType = (
          actualReturnType === Blockly.PROCEDURES_CALL_TYPE_BOOLEAN ?
          actualReturnType :
          (
            actualReturnType === Blockly.PROCEDURES_CALL_TYPE_OBJECT ?
            actualReturnType :
            (
              actualReturnType === Blockly.PROCEDURES_CALL_TYPE_ARRAY ?
              actualReturnType :
              Blockly.PROCEDURES_CALL_TYPE_REPORTER
            )
          )
        );
      } else {
        newType = Blockly.PROCEDURES_CALL_TYPE_STATEMENT;
      }

      Blockly.Events.setGroup(true);
      try {
        Blockly.Procedures.changeReturnType(block, newType);
      } finally {
        Blockly.Events.setGroup(false);
      }
    }
  };
  return option;
};

Blockly.Procedures.changeReturnType = function(block, returnType) {
  block.unplug(true);
  var workspace = block.workspace;
  var xml = Blockly.Xml.blockToDom(block);
  var xy = block.getRelativeToSurfaceXY();
  block.dispose();

  var mutation = xml.querySelector('mutation');
  mutation.setAttribute('return', returnType);

  var newBlock = Blockly.Xml.domToBlock(xml, workspace);
  newBlock.moveBy(xy.x, xy.y);
};

/**
 * Callback to show the procedure definition corresponding to a custom command
 * block.
 * TODO(#1136): Implement.
 * @param {!Blockly.Block} block The block that was right-clicked.
 * @private
 */
Blockly.Procedures.showProcedureDefCallback_ = function(block) {
  alert('TODO(#1136): implement showing procedure definition (procCode was "' +
      block.procCode_ + '")');
};

/**
 * Make a context menu option for showing the definition for a custom procedure,
 * based on a right-click on a custom command block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.Procedures.makeShowDefinitionOption = function(block) {
  var option = {
    enabled: true,
    text: Blockly.Msg.SHOW_PROCEDURE_DEFINITION,
    callback: function() {
      Blockly.Procedures.showProcedureDefCallback_(block);
    }
  };
  return option;
};

/**
 * Callback to try to delete a custom block definitions.
 * @param {string} procCode The identifier of the procedure to delete.
 * @param {!Blockly.Block} definitionRoot The root block of the stack that
 *     defines the custom procedure.
 * @return {boolean} True if the custom procedure was deleted, false otherwise.
 * @package
 */
Blockly.Procedures.deleteProcedureDefCallback = function(procCode,
    definitionRoot) {
  var callers = Blockly.Procedures.getCallers(procCode,
      definitionRoot.workspace, definitionRoot, false /* allowRecursive */);
  if (callers.length > 0) {
    return false;
  }

  var workspace = definitionRoot.workspace;

  // Delete the whole stack.
  Blockly.Events.setGroup(true);
  definitionRoot.dispose();
  Blockly.Events.setGroup(false);

  // TODO (#1354) Update this function when '_' is removed
  // Refresh toolbox, so caller doesn't appear there anymore
  workspace.refreshToolboxSelection_();

  return true;
};

/**
 * If true, the user will be able to manually override the shape of procedure call blocks.
 */
Blockly.Procedures.USER_CAN_CHANGE_CALL_TYPE = true;

/**
 * If false, a round procedure call reporter can be dropped into any input, including boolean ones.
 */
Blockly.Procedures.ENFORCE_TYPES = false;

/**
 * @param {string} procCode The procedure code
 * @param {Blockly.Workspace} workspace The workspace
 * @returns {number} The type of the return block
 */
Blockly.Procedures.getProcedureReturnType = function(procCode, workspace) {
  var defineBlock = Blockly.Procedures.getDefineBlock(procCode, workspace);
  if (!defineBlock) {
    if (workspace.getGlobalProcedureMutationByProccode) {
      var globalMutation = workspace.getGlobalProcedureMutationByProccode(procCode);
      if (globalMutation) {
        return Blockly.ScratchBlocks.ProcedureUtils.parseReturnMutation(globalMutation);
      }
    }
    return Blockly.PROCEDURES_CALL_TYPE_STATEMENT;
  }
  return Blockly.Procedures.getBlockReturnType(defineBlock);
};

/**
 * @param {Blockly.Workspace} workspace The workspace
 * @returns {Record<string, number>} The return type of each procedure in the workspace.
 */
Blockly.Procedures.getAllProcedureReturnTypes = function(workspace) {
  var result = Object.create(null);
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.type == Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE && !block.isInsertionMarker()) {
      var procCode = block.getInput('custom_block').connection.targetBlock().getProcCode();
      // To match behavior of getDefineBlock, if multiple instances of this procedure are
      // defined, only use the first one.
      if (!Object.prototype.hasOwnProperty.call(result, procCode)) {
        result[procCode] = Blockly.Procedures.getBlockReturnType(block);
      }
    }
  }
  return result;
};

/**
 * @param {Blockly.Block} block The block
 * @returns {number} The type of the return block
 */
Blockly.Procedures.getBlockReturnType = function(block) {
  var hasSeenBooleanReturn = false;
  var hasSeenObjectReturn = false;
  var hasSeenArrayReturn = false;
  /** @type {Blockly.Block[]} */
  var descendants = block.getDescendants();
  for (var i = 0; i < descendants.length; i++) {
    if (descendants[i].type === Blockly.PROCEDURES_RETURN_BLOCK_TYPE) {
      // The block at i + 1 should be the block inside of the return block.
      // Even if the return block is missing its input, this will still be fine, because the
      // next block should a stacked block which won't be hexagon-shaped.
      if (i + 1 < descendants.length && descendants[i + 1].outputShape_ === Blockly.OUTPUT_SHAPE_HEXAGONAL) {
        // keep searching, because there may be other, non-boolean returns in this function definition.
        hasSeenBooleanReturn = true;
      } else if (i + 1 < descendants.length && descendants[i + 1].outputShape_ === Blockly.OUTPUT_SHAPE_OBJECT) {
        // keep searching, because there may be other, non-object returns in this function definition.
        hasSeenObjectReturn = true;
      } else if (i + 1 < descendants.length && descendants[i + 1].outputShape_ === Blockly.OUTPUT_SHAPE_SQUARE) {
        // keep searching, because there may be other, non-array returns in this function definition.
        hasSeenArrayReturn = true;
      } else {
        return Blockly.PROCEDURES_CALL_TYPE_REPORTER;
      }
    }
  }
  if (hasSeenBooleanReturn) {
    return Blockly.PROCEDURES_CALL_TYPE_BOOLEAN;
  } else if (hasSeenObjectReturn) {
    return Blockly.PROCEDURES_CALL_TYPE_OBJECT;
  } else if (hasSeenArrayReturn) {
    return Blockly.PROCEDURES_CALL_TYPE_ARRAY;
  } else {
    return Blockly.PROCEDURES_CALL_TYPE_STATEMENT;
  }
};
