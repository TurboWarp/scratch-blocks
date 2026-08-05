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
 * @fileoverview Procedure blocks for Scratch.
 */
'use strict';

goog.provide('Blockly.ScratchBlocks.ProcedureUtils');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

// Serialization and deserialization.

Blockly.ScratchBlocks.ProcedureUtils.parseReturnMutation = function(xmlElement) {
  if (xmlElement.hasAttribute('return')) {
    var type = +xmlElement.getAttribute('return');
    if (
      type === Blockly.PROCEDURES_CALL_TYPE_STATEMENT ||
      type === Blockly.PROCEDURES_CALL_TYPE_REPORTER ||
      type === Blockly.PROCEDURES_CALL_TYPE_BOOLEAN ||
      type === Blockly.PROCEDURES_CALL_TYPE_OBJECT ||
      type === Blockly.PROCEDURES_CALL_TYPE_ARRAY
    ) {
      return type;
    }
  }
  return Blockly.PROCEDURES_CALL_TYPE_STATEMENT;
};

/**
 * Create XML to represent the (non-editable) name and arguments of a procedure
 * call block.
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.callerMutationToDom = function() {
  var container = document.createElement('mutation');
  container.setAttribute('proccode', this.procCode_);
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  container.setAttribute('argumentdropdowns', JSON.stringify(this.argumentDropdowns_));
  container.setAttribute('warp', JSON.stringify(this.warp_));
  container.setAttribute('global', JSON.stringify(this.global_));
  container.setAttribute('colour', this.colour_);
  if (this.return_ !== Blockly.PROCEDURES_CALL_TYPE_STATEMENT) {
    container.setAttribute('return', this.return_);
  }
  return container;
};

/**
 * Parse XML to restore the (non-editable) name and arguments of a procedure
 * call block.
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.callerDomToMutation = function(xmlElement) {
  this.procCode_ = xmlElement.getAttribute('proccode');
  this.generateShadows_ =
      JSON.parse(xmlElement.getAttribute('generateshadows'));
  this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids'));
  this.argumentDropdowns_ = JSON.parse(xmlElement.getAttribute('argumentdropdowns'));
  this.warp_ = JSON.parse(xmlElement.getAttribute('warp'));
  this.global_ = JSON.parse(xmlElement.getAttribute('global'));
  if (xmlElement.getAttribute('colour')) {
    this.colours_ = Blockly.ScratchBlocks.ProcedureUtils.matchColours(
      xmlElement.getAttribute('colour')
    );
  }
  this.return_ = Blockly.ScratchBlocks.ProcedureUtils.parseReturnMutation(xmlElement);
  this.updateDisplay_();
};

/**
 * Create XML to represent the (non-editable) name and arguments of a
 * procedures_prototype block or a procedures_declaration block.
 * @param {boolean=} opt_generateShadows Whether to include the generateshadows
 *     flag in the generated XML.  False if not provided.
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.definitionMutationToDom = function(
    opt_generateShadows) {
  var container = document.createElement('mutation');

  if (opt_generateShadows) {
    container.setAttribute('generateshadows', true);
  }
  container.setAttribute('proccode', this.procCode_);
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  container.setAttribute('argumentnames', JSON.stringify(this.displayNames_));
  container.setAttribute('argumentdefaults',
      JSON.stringify(this.argumentDefaults_));
  container.setAttribute('argumentdropdowns', JSON.stringify(this.argumentDropdowns_));
  container.setAttribute('warp', JSON.stringify(this.warp_));
  container.setAttribute('global', JSON.stringify(this.global_));
  container.setAttribute('colour', this.colour_);
  if (this.return_ !== Blockly.PROCEDURES_CALL_TYPE_STATEMENT) {
    container.setAttribute('return', this.return_);
  }
  return container;
}

/**
 * Generate colours 2 - 4.
 * @param {string} colour1 The first colour.
 * @param {!number} ld Lighten / Darken percent as a value from 0 - 1.
 * @returns {string[]} Colours 2 - 4.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.matchColours = function(colour1, ld) {
  ld = (ld == null) ? 0.75 : ld; // 25 percent
  colour1 = colour1.toLowerCase();
  var categorys = Object.values(Blockly.Categories);
  var maybeColours = Object.entries(Blockly.Colours).find(v => (
    categorys.includes(v[0]) && (v[1].primary.toLowerCase() === colour1)
  ));
  if (maybeColours && maybeColours[1]) return [
    maybeColours[1].primary,
    maybeColours[1].secondary,
    maybeColours[1].tertiary,
    maybeColours[1].quaternary || maybeColours[1].tertiary
  ];
  var c = parseInt(colour1.slice(1, 7), 16);
  var rgb = [(c >> 16), ((c >> 8) & 0x00ff), (c & 0x0000ff)];
  rgb[0] = Math.floor(rgb[0] * ld) % 256;
  rgb[1] = Math.floor(rgb[1] * ld) % 256;
  rgb[2] = Math.floor(rgb[2] * ld) % 256;
  var colour2 = '#' + (
    rgb[0].toString(16).padStart(2, '0') +
    rgb[1].toString(16).padStart(2, '0') +
    rgb[2].toString(16).padStart(2, '0') +
    colour1.slice(8)
  );
  return [colour1, colour2, colour2/*3*/, colour2/*4*/];
};

/**
 * Parse XML to restore the (non-editable) name and arguments of a
 * procedures_prototype block or a procedures_declaration block.
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.definitionDomToMutation = function(xmlElement) {
  this.procCode_ = xmlElement.getAttribute('proccode');
  this.warp_ = JSON.parse(xmlElement.getAttribute('warp'));
  this.global_ = JSON.parse(xmlElement.getAttribute('global'));
  this.return_ = Blockly.ScratchBlocks.ProcedureUtils.parseReturnMutation(xmlElement);

  if (xmlElement.getAttribute('colour')) {
    this.colours_ = Blockly.ScratchBlocks.ProcedureUtils.matchColours(
      xmlElement.getAttribute('colour')
    );
  }

  var prevArgIds = this.argumentIds_;
  var prevDisplayNames = this.displayNames_;

  this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids'));
  this.displayNames_ = JSON.parse(xmlElement.getAttribute('argumentnames'));
  this.argumentDefaults_ = JSON.parse(
      xmlElement.getAttribute('argumentdefaults'));
  this.argumentDropdowns_ = JSON.parse(
    xmlElement.getAttribute('argumentdropdowns'));
  this.updateDisplay_();
  if (this.updateArgumentReporterNames_) {
    this.updateArgumentReporterNames_(prevArgIds, prevDisplayNames);
  }
};

// End of serialization and deserialization.

// Shared by all three procedure blocks (procedures_declaration,
// procedures_call, and procedures_prototype).
/**
 * Returns the name of the procedure this block calls, or the empty string if
 * it has not yet been set.
 * @return {string} Procedure name.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.getProcCode = function() {
  return this.procCode_;
};

/**
 * Update the block's structure and appearance to match the internally stored
 * mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.updateDisplay_ = function() {
  var wasRendered = this.rendered;
  this.rendered = false;

  var connectionMap = this.disconnectOldBlocks_();
  this.removeAllInputs_();

  // We don't wanna do this on any other block's.
  if (this.type == 'procedures_prototype' || this.type == 'procedures_call' || this.type === 'procedures_declaration') {
    if (this.colours_) {
      this.setColour(...this.colours_);

      if (this.type == 'procedures_prototype') {
        queueMicrotask(() => {
          this.parentBlock_.setColour(...this.colours_);
          this.updateColour();
          this.colours_ = null;
        });
      } else {
        this.colours_ = null;
      }
    }
     // We delete this.colours_ so it doesn't break colour changing.
  }

  this.createAllInputs_(connectionMap);
  this.deleteShadows_(connectionMap);

  if (!wasRendered && this.getReturn) {
    this.setInputsInline(true);
    if (this.getReturn() === Blockly.PROCEDURES_CALL_TYPE_STATEMENT) {
      this.setPreviousStatement(true, "normal");
      this.setNextStatement(true, "normal");
    } else if (/*this.inputList.find(v => v.type == Blockly.NEXT_STATEMENT)*/false) {
      this.setOutput(true, null);
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE);
    } else {
      if (this.getReturn() === Blockly.PROCEDURES_CALL_TYPE_BOOLEAN) {
        this.setOutput(true, null);
        this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
      } else if (this.getReturn() === Blockly.PROCEDURES_CALL_TYPE_OBJECT) {
        this.setOutput(true, null);
        this.setOutputShape(Blockly.OUTPUT_SHAPE_OBJECT);
      } else if (this.getReturn() === Blockly.PROCEDURES_CALL_TYPE_ARRAY) {
        this.setOutput(true, null);
        this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE);
      } else {
        this.setOutput(true, Blockly.Procedures.ENFORCE_TYPES ? 'Number' : null);
        this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
      }
    }
  }

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }
};

/**
 * Disconnect old blocks from all value inputs on this block, but hold onto them
 * in case they can be reattached later.  Also save the shadow DOM if it exists.
 * The result is a map from argument ID to information that was associated with
 * that argument at the beginning of the mutation.
 * @return {!Object.<string, {shadow: Element, block: Blockly.Block}>} An object
 *     mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_ = function() {
  // Remove old stuff
  var connectionMap = {};
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.connection) {
      var target = input.connection.targetBlock();
      var saveInfo = {
        shadow: input.connection.getShadowDom(),
        block: target
      };
      connectionMap[input.name] = saveInfo;

      // Remove the shadow DOM, then disconnect the block.  Otherwise a shadow
      // block will respawn instantly, and we'd have to remove it when we remove
      // the input.
      input.connection.setShadowDom(null);
      if (target) {
        input.connection.disconnect();
      }
    }
  }
  return connectionMap;
};

/**
 * Remove all inputs on the block, including dummy inputs.
 * Assumes no input has shadow DOM set.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_ = function() {
  // Delete inputs directly instead of with block.removeInput to avoid splicing
  // out of the input list at every index.
  for (var i = 0, input; input = this.inputList[i]; i++) {
    input.dispose();
  }
  this.inputList = [];
};

/**
 * Create all inputs specified by the new procCode, and populate them with
 * shadow blocks or reconnected old blocks as appropriate.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_ = function(connectionMap) {
  // Split the proc into components, by arguments and the internal %l label
  // delimiter (ignoring escaped percent signs). The delimiter keeps adjacent
  // labels separate while inputs are being rearranged in the declaration UI.
  var procComponents = this.procCode_.split(/(?=[^\\]%[nbdoascl])/);
  procComponents = procComponents.map(function(c) {
    return c.trim(); // Strip whitespace.
  });
  // Create arguments and labels as appropriate.
  var argumentCount = 0;
  var dropdownCount = 0;
  var hasAnyField = false;
  for (var i = 0, component; component = procComponents[i]; i++) {
    var labelText;
    if (component.substring(0, 1) == '%' &&
        component.substring(1, 2) != 'l') {
      var argumentType = component.substring(1, 2);
      if (!['n', 'b', 'd', 'o', 'a', 's', 'c'].includes(argumentType)) {
        throw new Error(
            'Found an custom procedure with an invalid type: ' + argumentType);
      }
      labelText = component.substring(2).trim();

      var id = this.argumentIds_[argumentCount];

      var input;
      if (argumentType === 'c') {
        input = this.appendStatementInput(id)
            .setCheck(this.type == 'procedures_prototype' ? 'argumentReporterCommand' : 'normal');
      } else {
        input = this.appendValueInput(id);
        if (argumentType == 'b') {
          input.setCheck('Boolean');
        } else if (argumentType == 'o') {
          input.setCheck('Object');
        } else if (argumentType == 'a') {
          input.setCheck('Array');
        } else if (argumentType == 'd' && this.argumentDropdowns_[dropdownCount]) {
          var dropdownOptions = this.argumentDropdowns_[dropdownCount].map(o => [o, o]);
          dropdownCount++;
        }
      }
      this.populateArgument_(argumentType, argumentCount, connectionMap, id,
          input, dropdownOptions);
      hasAnyField = true;
      argumentCount++;
    } else {
      labelText = component == '%l' ? ' ' :
        component.replace('%l', '').trim();
    }
    labelText = labelText.replace(/\\%/, '%');
    // don't add empty labels which will just waste space
    if (labelText) {
      this.addProcedureLabel_(labelText);
      hasAnyField = true;
    }
  }
  // Custom reporters will crash editor if they have no fields.
  if (!hasAnyField) {
    this.addProcedureLabel_(' ');
  }
  // %l is only an editor delimiter; it must never become part of a saved
  // procedure code.
  this.procCode_ = this.procCode_.replace(/%l /g, '');
};

/**
 * Delete all shadow blocks in the given map.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     argument IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_ = function(connectionMap) {
  // Get rid of all of the old shadow blocks if they aren't connected.
  if (connectionMap) {
    for (var id in connectionMap) {
      var saveInfo = connectionMap[id];
      if (saveInfo) {
        var block = saveInfo['block'];
        if (block && block.isShadow()) {
          block.dispose();
          connectionMap[id] = null;
          // At this point we know which shadow DOMs are about to be orphaned in
          // the VM.  What do we do with that information?
        }
      }
    }
  }
};
// End of shared code.

/**
 * Add a label field with the given text to a procedures_call or
 * procedures_prototype block.
 * @param {string} text The label text.
 * @private
 */
Blockly.ScratchBlocks.ProcedureUtils.addLabelField_ = function(text) {
  this.appendDummyInput().appendField(text);
};

/**
 * Add a label editor with the given text to a procedures_declaration
 * block.  Editing the text in the label editor updates the text of the
 * corresponding label fields on function calls.
 * @param {string} text The label text.
 * @private
 */
Blockly.ScratchBlocks.ProcedureUtils.addLabelEditor_ = function(text) {
  if (text) {
    this.appendDummyInput(Blockly.utils.genUid()).
        appendField(new Blockly.FieldTextInputRemovable(text));
  }
};

/**
 * Build a DOM node representing a shadow block of the given type.
 * @param {string} type One of 's' (string) or 'n' (number).
 * @return {!Element} The DOM node representing the new shadow block.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.buildShadowDom_ = function(type) {
  var shadowDom = goog.dom.createDom('shadow');
  switch (type) {
    case 'n':
      var shadowType = 'math_number';
      var fieldName = 'NUM';
      var fieldValue = '1';
      break;
    case 'd':
      // ???
      break;
    case 's':
      var shadowType = 'text';
      var fieldName = 'TEXT';
      var fieldValue = '';
      break;
    case 'b':
      var shadowType = 'checkbox';
      var fieldName = 'CHECKBOX';
      var fieldValue = 'FALSE';
      break;
  }
  shadowDom.setAttribute('type', shadowType);
  var fieldDom = goog.dom.createDom('field', null, fieldValue);
  fieldDom.setAttribute('name', fieldName);
  shadowDom.appendChild(fieldDom);
  return shadowDom;
};

/**
 * Create a new shadow block and attach it to the given input.
 * @param {!Blockly.Input} input The value input to attach a block to.
 * @param {string} argumentType One of 'o' (object), 'a' (array),
 *     's' (string) or 'n' (number).
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.attachShadow_ = function(input,
    argumentType, dropdownOptions) {
  if (['n', 'd', 's'].includes(argumentType)) {
    var blockType = {
      'n': 'math_number',
      's': 'text',
      'd': 'procedures_dropdown'
    }[argumentType];
    Blockly.Events.disable();
    try {
      var newBlock = this.workspace.newBlock(blockType);
      switch (argumentType) {
        case 'n':
          newBlock.setFieldValue('1', 'NUM');
          break;
        case 'd':
          // ???
          break;
        case 's':
          newBlock.setFieldValue('', 'TEXT');
          break;
      }
      newBlock.setShadow(true);
      if (!this.isInsertionMarker()) {
        newBlock.initSvg();
        newBlock.render(false);
      }
    } finally {
      Blockly.Events.enable();
    }
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
    }
    newBlock.outputConnection.connect(input.connection);
  }
};

/**
 * Create a new argument reporter block.
 * @param {string} argumentType One of 'b' (boolean), 'o' (object), 'a' (array),
 *     's' (string) or 'n' (number).
 * @param {string} displayName The name of the argument as provided by the
 *     user, which becomes the text of the label on the argument reporter block.
 * @return {!Blockly.BlockSvg} The newly created argument reporter block.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.createArgumentReporter_ = function(
    argumentType, displayName) {
  if (argumentType == 'n' || argumentType == 's' || argumentType == 'd') {
    var blockType = 'argument_reporter_string_number';
  } else if (argumentType == 'b') {
    var blockType = 'argument_reporter_boolean';
  } else if (argumentType == 'o') {
    var blockType = 'argument_reporter_object';
  } else if (argumentType == 'a') {
    var blockType = 'argument_reporter_array';
  } else if (argumentType == 'c') {
    var blockType = 'argument_reporter_statement';
  }
  Blockly.Events.disable();
  try {
    var newBlock = this.workspace.newBlock(blockType);
    newBlock.setShadow(true);
    newBlock.setFieldValue(displayName, 'VALUE');
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
    if (argumentType === 'c') {
      newBlock.setPreviousStatement(true, 'argumentReporterCommand');
      newBlock.setNextStatement(true, 'argumentReporterCommand');
    }
  } finally {
    Blockly.Events.enable();
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
  }
  return newBlock;
};

/**
 * Updates the dropdown fields on procedure_call blocks.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.updateDropdowns_ = function() {
  var dropdownCount = 0;
  for (var i = 0, input; input = this.inputList[i]; i++) {
    var target = input.connection && input.connection.targetBlock();
    if (target && target.type == 'procedures_dropdown') {
      var options = this.argumentDropdowns_[dropdownCount++];
      var field = target.getField('DROPDOWN_VALUE');

      if (options.length === 0) {
        field.menuGenerator_ = [['', '']];
        field.setValue('');
        return;
      }

      field.menuGenerator_ = options.map(function(option) {
        return [option, option]; 
      });

      // If the current value isn't an option, set the value to the first option.
      var currentValue = field.getValue();
      if (!options.some(function(o) { return o === currentValue })) {
        field.setValue(options[0]);
      }
    }
  }
}

/**
 * Populate the argument by attaching the correct child block or shadow to the
 * given input.
 * @param {string} type One of 'b' (boolean), 'o' (object), 'a' (array), 's' (string) 'n' (number) or 'd' (dropdown).
 * @param {number} index The index of this argument into the argument id array.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param {string} id The ID of the input to populate.
 * @param {!Blockly.Input} input The newly created input to populate.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.populateArgumentOnCaller_ = function(type,
    index, connectionMap, id, input, dropdownOptions) {
  var oldBlock = null;
  var oldShadow = null;
  if (connectionMap && (id in connectionMap)) {
    var saveInfo = connectionMap[id];
    oldBlock = saveInfo['block'];
    oldShadow = saveInfo['shadow'];
  }

  if (connectionMap && oldBlock) {
    // Reattach the old block and shadow DOM.
    connectionMap[input.name] = null;
    if (type == 'c') oldBlock.previousConnection.connect(input.connection);
    else oldBlock.outputConnection.connect(input.connection);
    if ((['s', 'n', 'b', 'd'].includes(type)) && this.generateShadows_) {
      var shadowDom = oldShadow || this.buildShadowDom_(type);
      input.connection.setShadowDom(shadowDom);
    }
  } else if (this.generateShadows_) {
    this.attachShadow_(input, type, dropdownOptions);
  }
};

/**
 * Populate the argument by attaching the correct argument reporter to the given
 * input.
 * @param {string} type One of 'b' (boolean), 'o' (object), 'a' (array), 's' (string) or 'n' (number).
 * @param {number} index The index of this argument into the argument ID and
 *     argument display name arrays.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param {string} id The ID of the input to populate.
 * @param {!Blockly.Input} input The newly created input to populate.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.populateArgumentOnPrototype_ = function(
    type, index, connectionMap, id, input) {
  var oldBlock = null;
  if (connectionMap && (id in connectionMap)) {
    var saveInfo = connectionMap[id];
    oldBlock = saveInfo['block'];
  }

  var oldTypeMatches =
    Blockly.ScratchBlocks.ProcedureUtils.checkOldTypeMatches_(oldBlock, type);
  var displayName = this.displayNames_[index];

  // Decide which block to attach.
  if (connectionMap && oldBlock && oldTypeMatches) {
    // Update the text if needed. The old argument reporter is the same type,
    // and on the same input, but the argument's display name may have changed.
    var argumentReporter = oldBlock;
    argumentReporter.setFieldValue(displayName, 'VALUE');
    connectionMap[input.name] = null;
  } else {
    var argumentReporter = this.createArgumentReporter_(type, displayName);
  }

  // Attach the block.
  if (type == 'c') input.connection.connect(argumentReporter.previousConnection);
  else input.connection.connect(argumentReporter.outputConnection);
};

/**
 * Populate the argument by attaching the correct argument editor to the given
 * input.
 * @param {string} type One of 'b' (boolean), 'o' (object), 'a' (array), 's' (string) or 'n' (number).
 * @param {number} index The index of this argument into the argument id and
 *     argument display name arrays.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param {string} id The ID of the input to populate.
 * @param {!Blockly.Input} input The newly created input to populate.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.populateArgumentOnDeclaration_ = function(
    type, index, connectionMap, id, input, dropdownOptions) {

  var oldBlock = null;
  if (connectionMap && (id in connectionMap)) {
    var saveInfo = connectionMap[id];
    oldBlock = saveInfo['block'];
  }

  // TODO: This always returns false, because it checks for argument reporter
  // blocks instead of argument editor blocks.  Create a new version for argument
  // editors.
  var oldTypeMatches =
    Blockly.ScratchBlocks.ProcedureUtils.checkOldTypeMatches_(oldBlock, type);
  var displayName = this.displayNames_[index];

  // Decide which block to attach.
  if (oldBlock && oldTypeMatches) {
    var argumentEditor = oldBlock;
    oldBlock.setFieldValue(displayName, 'TEXT');
    connectionMap[input.name] = null;
  } else {
    var argumentEditor = this.createArgumentEditor_(type, displayName);
  }

  // Set dropdown options if this is a dropdown argument
  if (type === 'd' && dropdownOptions) {
    var field = argumentEditor.inputList[0].fieldRow[0];
    field.menuGenerator_ = dropdownOptions;
  }

  // Attach the block.
  if (type == 'c') input.connection.connect(argumentEditor.previousConnection)
  else input.connection.connect(argumentEditor.outputConnection);
};

/**
 * Check whether the type of the old block corresponds to the given argument
 * type.
 * @param {Blockly.BlockSvg} oldBlock The old block to check.
 * @param {string} type The argument type.  One of 'b', 'o', 'a', 'n', or 's'.
 * @return {boolean} True if the type matches, false otherwise.
 */
Blockly.ScratchBlocks.ProcedureUtils.checkOldTypeMatches_ = function(oldBlock,
    type) {
  if (!oldBlock) {
    return false;
  }
  if ((type == 'n' || type == 's' || type == 'd') &&
      oldBlock.type == 'argument_reporter_string_number') {
    return true;
  }
  if (type == 'b' && oldBlock.type == 'argument_reporter_boolean') {
    return true;
  }
  if (type == 'o' && oldBlock.type == 'argument_reporter_object') {
    return true;
  }
  if (type == 'a' && oldBlock.type == 'argument_reporter_array') {
    return true;
  }
  if (type == 'c' && oldBlock.type == 'argument_reporter_statement') {
    return true;
  }
  return false;
};

/**
 * Create an argument editor.
 * An argument editor is a shadow block with a single text field, which is used
 * to set the display name of the argument.
 * @param {string} argumentType One of 'b' (boolean), 'o' (object), 'a' (array),
 *     's' (string) or 'n' (number).
 * @param {string} displayName The display name  of this argument, which is the
 *     text of the field on the shadow block.
 * @return {!Blockly.BlockSvg} The newly created argument editor block.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.createArgumentEditor_ = function(
    argumentType, displayName) {
  Blockly.Events.disable();
  try {
    if (argumentType == 'n' || argumentType == 's') {
      var newBlock = this.workspace.newBlock('argument_editor_string_number');
    } else if (argumentType == 'b') {
      var newBlock = this.workspace.newBlock('argument_editor_boolean');
    } else if (argumentType == 'o') {
      var newBlock = this.workspace.newBlock('argument_editor_object');
    } else if (argumentType == 'a') {
      var newBlock = this.workspace.newBlock('argument_editor_array');
    } else if (argumentType == 'd') {
      var newBlock = this.workspace.newBlock('argument_editor_dropdown');
    } else if (argumentType == 'c') {
      var newBlock = this.workspace.newBlock('argument_editor_statement');
    }
    newBlock.setFieldValue(displayName, 'TEXT');
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  } finally {
    Blockly.Events.enable();
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
  }
  return newBlock;
};

/**
 * Update the serializable information on the block based on the existing inputs
 * and their text.
 * @param {boolean=} opt_separateLabels Whether to delimit adjacent labels while
 *     rebuilding the declaration editor.
 */
Blockly.ScratchBlocks.ProcedureUtils.updateDeclarationProcCode_ = function(opt_separateLabels) {
  this.procCode_ = '';
  this.displayNames_ = [];
  this.argumentIds_ = [];
  this.argumentDropdowns_ = [];
  for (var i = 0; i < this.inputList.length; i++) {
    if (i != 0) {
      this.procCode_ += ' ';
    }
    var input = this.inputList[i];
    if (input.type == Blockly.DUMMY_INPUT) {
      this.procCode_ += (opt_separateLabels ? '%l ' : '') +
        input.fieldRow[0].getValue();
    } else if (input.type == Blockly.INPUT_VALUE) {
      // Inspect the argument editor.
      var target = input.connection.targetBlock();
      this.displayNames_.push(target.getFieldValue('TEXT'));
      this.argumentIds_.push(input.name);
      if (target.type == 'argument_editor_boolean') {
        this.procCode_ += '%b';
      } else if (target.type == 'argument_editor_object') {
        this.procCode_ += '%o';
      } else if (target.type == 'argument_editor_array') {
        this.procCode_ += '%a';
      } else if (target.type == 'argument_editor_dropdown') {
        this.procCode_ += '%d';
        var options = target.inputList[0].fieldRow[0].getOptions();
        this.argumentDropdowns_.push(options.filter(Boolean).map(o => o[0]));
      } else {
        this.procCode_ += '%s';
      }
    } else if (input.type == Blockly.NEXT_STATEMENT) {
      var target = input.connection.targetBlock();
      this.displayNames_.push(target.getFieldValue('TEXT'));
      this.argumentIds_.push(input.name);
      this.procCode_ += '%c';
    } else {
      throw new Error(
          'Unexpected input type on a procedure mutator root: ' + input.type);
    }
  }
};

/**
 * Move the input containing a field one place in either direction.
 * @param {Blockly.Field} field Field whose containing input should move.
 * @param {number} direction -1 to move left, 1 to move right.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.shiftFieldCallback = function(field, direction) {
  var declaration = this.parentBlock_ || this;
  if (declaration.type != 'procedures_declaration' ||
      declaration.inputList.length <= 1) {
    return;
  }

  var oldIndex = -1;
  for (var i = 0; i < declaration.inputList.length; i++) {
    var input = declaration.inputList[i];
    var containsField = input.connection ?
      input.connection.targetBlock().getField(field.name) == field :
      input.fieldRow.indexOf(field) != -1;
    if (containsField) {
      oldIndex = i;
      break;
    }
  }

  var newIndex = oldIndex + direction;
  if (oldIndex < 0 || newIndex < 0 ||
      newIndex >= declaration.inputList.length) {
    return;
  }

  var reorderedInputs = declaration.inputList.slice();
  var movedInput = reorderedInputs.splice(oldIndex, 1)[0];
  reorderedInputs.splice(newIndex, 0, movedInput);
  if (reorderedInputs[0].type == Blockly.NEXT_STATEMENT) {
    return;
  }
  declaration.inputList.splice.apply(declaration.inputList,
      [0, declaration.inputList.length].concat(reorderedInputs));
  Blockly.Events.disable();
  try {
    declaration.onChangeFn(true);
    declaration.updateDisplay_();
  } finally {
    Blockly.Events.enable();
  }

  var focusedInput = declaration.inputList[newIndex];
  if (focusedInput.type == Blockly.DUMMY_INPUT) {
    focusedInput.fieldRow[0].showEditor_();
  } else {
    focusedInput.connection.targetBlock().getField('TEXT').showEditor_();
  }
};

/**
 * Focus on the last argument editor or label editor on the block.
 * @private
 */
Blockly.ScratchBlocks.ProcedureUtils.focusLastEditor_ = function() {
  if (this.inputList.length > 0) {
    var newInput = this.inputList[this.inputList.length - 1];
    if (newInput.type == Blockly.DUMMY_INPUT) {
      newInput.fieldRow[0].showEditor_();
    } else if (newInput.type == Blockly.INPUT_VALUE) {
      // Inspect the argument editor.
      var target = newInput.connection.targetBlock();
      target.getField('TEXT').showEditor_();
    }
  }
};

/**
 * Return the index containing the most recently selected declaration field.
 * @return {number} The selected input index, or -1 if it is no longer valid.
 * @private
 */
Blockly.ScratchBlocks.ProcedureUtils.getSelectedInputIndex_ = function() {
  var selectedField = this.selectedField_;
  if (!selectedField) {
    return -1;
  }
  for (var i = 0; i < this.inputList.length; i++) {
    var input = this.inputList[i];
    if (input.connection) {
      var target = input.connection.targetBlock();
      if (target && target.getField(selectedField.name) == selectedField) {
        return i;
      }
    } else if (input.fieldRow.indexOf(selectedField) != -1) {
      return i;
    }
  }
  return -1;
};

/**
 * Finish adding an input, moving it after the selected input when appropriate.
 * @param {number} selectedIndex The selected input index before rebuilding.
 * @private
 */
Blockly.ScratchBlocks.ProcedureUtils.finishAddingInput_ = function(
    selectedIndex) {
  var newIndex = this.inputList.length - 1;
  if (selectedIndex >= 0 && selectedIndex < newIndex) {
    var newInput = this.inputList.pop();
    newIndex = selectedIndex + 1;
    this.inputList.splice(newIndex, 0, newInput);
    Blockly.Events.disable();
    try {
      this.onChangeFn(true);
      this.updateDisplay_();
    } finally {
      Blockly.Events.enable();
    }
  }

  var input = this.inputList[newIndex];
  if (input.type == Blockly.DUMMY_INPUT) {
    input.fieldRow[0].showEditor_();
  } else {
    input.connection.targetBlock().getField('TEXT').showEditor_();
  }
};

/**
 * Return an unused display name for a new procedure argument.
 * Numbering starts at 2, for example "boolean", "boolean2", "boolean3".
 * @param {string} baseName The default name for this argument type.
 * @return {string} An unused argument name.
 * @private
 */
Blockly.ScratchBlocks.ProcedureUtils.getUniqueArgumentName_ = function(
    baseName) {
  var usedNames = Object.create(null);
  for (var i = 0; i < this.inputList.length; i++) {
    var input = this.inputList[i];
    var target = input.connection && input.connection.targetBlock();
    var field = target && target.getField('TEXT');
    if (field) {
      usedNames[field.getValue()] = true;
    }
  }

  var name = baseName;
  var suffix = 2;
  while (usedNames[name]) {
    name = baseName + suffix;
    suffix++;
  }
  return name;
};

/**
 * Reject a procedure argument name already used by another argument.
 * @param {string} proposedName The name entered by the user.
 * @return {?string} The name, or null when another argument already uses it.
 * @this Blockly.Field
 * @private
 */
Blockly.ScratchBlocks.ProcedureUtils.argumentNameValidator_ = function(
    proposedName) {
  if (!proposedName || !proposedName.trim()) {
    return null;
  }

  var argumentBlock = this.sourceBlock_;
  var declaration = argumentBlock && argumentBlock.parentBlock_;
  if (!declaration || declaration.type != 'procedures_declaration') {
    return proposedName;
  }

  for (var i = 0; i < declaration.inputList.length; i++) {
    var input = declaration.inputList[i];
    var target = input.connection && input.connection.targetBlock();
    var field = target && target.getField('TEXT');
    if (field && field !== this && field.getValue() === proposedName) {
      return null;
    }
  }
  return proposedName;
};

/**
 * Externally-visible function to add a label to the procedure declaration.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.addLabelExternal = function() {
  var selectedIndex = this.getSelectedInputIndex_();
  Blockly.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' label text';
  this.updateDisplay_();
  this.finishAddingInput_(selectedIndex);
};

/**
 * Externally-visible function to add a label to the procedure declaration.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.addDropdownExternal = function() {
  var selectedIndex = this.getSelectedInputIndex_();
  Blockly.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %d';
  this.displayNames_.push(this.getUniqueArgumentName_('dropdown'));
  this.argumentIds_.push(Blockly.utils.genUid());
  this.argumentDefaults_.push('Option');
  this.argumentDropdowns_.push(['Option']);
  this.updateDisplay_();
  this.finishAddingInput_(selectedIndex);
};

/**
 * Externally-visible function to add a boolean argument to the procedure
 * declaration.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.addBooleanExternal = function() {
  var selectedIndex = this.getSelectedInputIndex_();
  Blockly.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %b';
  this.displayNames_.push(this.getUniqueArgumentName_('boolean'));
  this.argumentIds_.push(Blockly.utils.genUid());
  this.argumentDefaults_.push('false');
  this.updateDisplay_();
  this.finishAddingInput_(selectedIndex);
};

/**
 * Externally-visible function to add a object argument to the procedure
 * declaration.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.addObjectExternal = function() {
  var selectedIndex = this.getSelectedInputIndex_();
  Blockly.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %o';
  this.displayNames_.push(this.getUniqueArgumentName_('object'));
  this.argumentIds_.push(Blockly.utils.genUid());
  this.argumentDefaults_.push(new Object());
  this.updateDisplay_();
  this.finishAddingInput_(selectedIndex);
};

/**
 * Externally-visible function to add a array argument to the procedure
 * declaration.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.addArrayExternal = function() {
  var selectedIndex = this.getSelectedInputIndex_();
  Blockly.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %a';
  this.displayNames_.push(this.getUniqueArgumentName_('array'));
  this.argumentIds_.push(Blockly.utils.genUid());
  this.argumentDefaults_.push(new Array());
  this.updateDisplay_();
  this.finishAddingInput_(selectedIndex);
};

/**
 * Externally-visible function to add a statement argument to the procedure
 * declaration.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.addStatementExternal = function() {
  var selectedIndex = this.getSelectedInputIndex_();
  Blockly.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %c';
  this.displayNames_.push(this.getUniqueArgumentName_('statement'));
  this.argumentIds_.push('SUBSTACK' + Blockly.utils.genUid());
  this.argumentDefaults_.push('');
  this.updateDisplay_();
  this.finishAddingInput_(selectedIndex);
};

/**
 * Externally-visible function to add a string/number argument to the procedure
 * declaration.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.addStringNumberExternal = function() {
  var selectedIndex = this.getSelectedInputIndex_();
  Blockly.WidgetDiv.hide(true);
  this.procCode_ = this.procCode_ + ' %s';
  this.displayNames_.push(this.getUniqueArgumentName_('number or text'));
  this.argumentIds_.push(Blockly.utils.genUid());
  this.argumentDefaults_.push('');
  this.updateDisplay_();
  this.finishAddingInput_(selectedIndex);
};

/**
 * Externally-visible function to get the warp on procedure declaration.
 * @return {boolean} The value of the warp_ property.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.getWarp = function() {
  return this.warp_;
};

/**
 * Externally-visible function to set the warp on procedure declaration.
 * @param {boolean} warp The value of the warp_ property.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.setWarp = function(warp) {
  this.warp_ = warp;
};

/**
 * Externally-visible function to get the access mode on procedure declaration.
 * @return {boolean} The value of the global_ property.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.getGlobal = function() {
  return this.global_;
};

/**
 * Externally-visible function to set the access mode on procedure declaration.
 * @param {boolean} global The value of the global_ property.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.setGlobal = function(global) {
  this.global_ = global;
};

/**
 * @this {BlockSvg}
 * @returns {number} Value of the return_ property. See enum in constants.js
 */
Blockly.ScratchBlocks.ProcedureUtils.getReturn = function() {
  return this.return_;
};

/**
 * Callback to remove a field, only for the declaration block.
 * @param {Blockly.Field} field The field being removed.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.removeFieldCallback = function(field) {
  // Do not delete if there is only one input
  if (this.inputList.length === 1) {
    return;
  }
  var inputNameToRemove = null;
  const cannotRemove = (i) => i == 0 && this.inputList[1].type == Blockly.NEXT_STATEMENT
  for (var n = 0; n < this.inputList.length; n++) {
    var input = this.inputList[n];
    if (input.connection) {
      var target = input.connection.targetBlock();
      if (target.getField(field.name) == field) {
        if (cannotRemove(n)) return
        inputNameToRemove = input.name;
      }
    } else {
      if (input.fieldRow[0] == field) {
        if (cannotRemove(n)) return
        inputNameToRemove = input.name;
      }
    }
  }
  if (inputNameToRemove) {
    Blockly.WidgetDiv.hide(true);
    this.removeInput(inputNameToRemove);
    // Keep adjacent labels distinct while rebuilding the reordered input list.
    this.onChangeFn(true);
    this.updateDisplay_();
  }
};

/**
 * Callback to pass removeField up to the declaration block from arguments.
 * @param {Blockly.Field} field The field being removed.
 * @public
 */
Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_ = function(
    field) {
  if (this.parentBlock_ && this.parentBlock_.removeFieldCallback) {
    this.parentBlock_.removeFieldCallback(field);
  }
};

/**
 * Update argument reporter field values after an edit to the prototype mutation
 * using previous argument ids and names.
 * Because the argument reporters only store names and not which argument ids they
 * are linked to, it would not be safe to update all argument reporters on the workspace
 * since they may be argument reporters with the same name from a different procedure.
 * Until there is a more explicit way of identifying argument reporter blocks using ids,
 * be conservative and only update argument reporters that are used in the
 * stack below the prototype, ie the definition.
 * @param {!Array<string>} prevArgIds The previous ordering of argument ids.
 * @param {!Array<string>} prevDisplayNames The previous argument names.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.updateArgumentReporterNames_ = function(prevArgIds, prevDisplayNames) {
  var nameChanges = [];
  var argReporters = [];
  var definitionBlock = this.getParent();
  if (!definitionBlock) return;

  // Create a list of argument reporters that are descendants of the definition stack (see above comment)
  var allBlocks = definitionBlock.getDescendants(false);
  for (var i = 0; i < allBlocks.length; i++) {
    var block = allBlocks[i];
    if ((block.type === 'argument_reporter_string_number' ||
        block.type === 'argument_reporter_boolean' ||
        block.type === 'argument_reporter_object' ||
        block.type === 'argument_reporter_array' ||
        block.type === 'argument_reporter_statement'
    ) && !block.isShadow()) { // Exclude arg reporters in the prototype block, which are shadows.
      argReporters.push(block);
    }
  }

  // Create a list of "name changes", including the new name and blocks matching the old name
  // Only search over the current set of argument ids, ignore args that have been removed
  for (var i = 0, id; id = this.argumentIds_[i]; i++) {
    // Find the previous index of this argument id. Could be -1 if it is newly added.
    var prevIndex = prevArgIds.indexOf(id);
    if (prevIndex == -1) continue; // Newly added argument, no corresponding previous argument to update.
    var prevName = prevDisplayNames[prevIndex];
    if (prevName != this.displayNames_[i]) {
      nameChanges.push({
        newName: this.displayNames_[i],
        blocks: argReporters.filter(function(block) {
          return block.getFieldValue('VALUE') == prevName;
        })
      });
    }
  }

  // Finally update the blocks for each name change.
  // Do this after creating the lists to avoid cycles of renaming.
  for (var j = 0, nameChange; nameChange = nameChanges[j]; j++) {
    for (var k = 0, block; block = nameChange.blocks[k]; k++) {
      block.setFieldValue(nameChange.newName, 'VALUE');
    }
  }
};

Blockly.Blocks['procedures_definition'] = {
  /**
   * Block for defining a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.PROCEDURES_DEFINITION,
      "args0": [
        {
          "type": "input_statement",
          "name": "custom_block"
        }
      ],
      "extensions": ["colours_more", "shape_hat", "procedure_def_contextmenu"]
    });
  }
};

Blockly.Blocks['procedures_call'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "extensions": ["colours_more", "procedure_call_contextmenu"]
    });
    this.procCode_ = '';
    this.argumentIds_ = [];
    this.argumentDropdowns_ = [];
    this.warp_ = false;
    this.global_ = false;
    this.return_ = Blockly.PROCEDURES_CALL_TYPE_STATEMENT;
  },
  // Shared.
  getProcCode: Blockly.ScratchBlocks.ProcedureUtils.getProcCode,
  removeAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_,
  createAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_,
  updateDisplay_: Blockly.ScratchBlocks.ProcedureUtils.updateDisplay_,
  getReturn: Blockly.ScratchBlocks.ProcedureUtils.getReturn,

  // Exist on all three blocks, but have different implementations.
  mutationToDom: Blockly.ScratchBlocks.ProcedureUtils.callerMutationToDom,
  domToMutation: Blockly.ScratchBlocks.ProcedureUtils.callerDomToMutation,
  populateArgument_: Blockly.ScratchBlocks.ProcedureUtils.populateArgumentOnCaller_,
  addProcedureLabel_: Blockly.ScratchBlocks.ProcedureUtils.addLabelField_,

  // Only exists on the external caller.
  attachShadow_: Blockly.ScratchBlocks.ProcedureUtils.attachShadow_,
  buildShadowDom_: Blockly.ScratchBlocks.ProcedureUtils.buildShadowDom_,
  updateDropdowns_: Blockly.ScratchBlocks.ProcedureUtils.updateDropdowns_,
  onchange: Blockly.ScratchBlocks.ProcedureUtils.updateDropdowns_
};

Blockly.Blocks['procedures_prototype'] = {
  /**
   * Block for calling a procedure with no return value, for rendering inside
   * define block.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "extensions": ["colours_more", "shape_statement"]
    });

    /* Data known about the procedure. */
    this.procCode_ = '';
    this.displayNames_ = [];
    this.argumentIds_ = [];
    this.argumentDefaults_ = [];
    this.argumentDropdowns_ = [];
    this.warp_ = false;
    this.global_ = false;
    this.return_ = Blockly.PROCEDURES_CALL_TYPE_STATEMENT;
  },
  // Shared.
  getProcCode: Blockly.ScratchBlocks.ProcedureUtils.getProcCode,
  removeAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_,
  createAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_,
  updateDisplay_: Blockly.ScratchBlocks.ProcedureUtils.updateDisplay_,

  // Exist on all three blocks, but have different implementations.
  mutationToDom: Blockly.ScratchBlocks.ProcedureUtils.definitionMutationToDom,
  domToMutation: Blockly.ScratchBlocks.ProcedureUtils.definitionDomToMutation,
  populateArgument_: Blockly.ScratchBlocks.ProcedureUtils.populateArgumentOnPrototype_,
  addProcedureLabel_: Blockly.ScratchBlocks.ProcedureUtils.addLabelField_,

  // Only exists on procedures_prototype.
  createArgumentReporter_: Blockly.ScratchBlocks.ProcedureUtils.createArgumentReporter_,
  updateArgumentReporterNames_: Blockly.ScratchBlocks.ProcedureUtils.updateArgumentReporterNames_
};

Blockly.Blocks['procedures_declaration'] = {
  /**
   * The root block in the procedure declaration editor.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "extensions": ["colours_more", "shape_statement"]
    });
    /* Data known about the procedure. */
    this.procCode_ = '';
    this.displayNames_ = [];
    this.argumentIds_ = [];
    this.argumentDefaults_ = [];
    this.argumentDropdowns_ = [];
    this.warp_ = false;
    this.global_ = false;
    this.return_ = Blockly.PROCEDURES_CALL_TYPE_STATEMENT;
  },
  // Shared.
  getProcCode: Blockly.ScratchBlocks.ProcedureUtils.getProcCode,
  removeAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_,
  createAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_,
  updateDisplay_: Blockly.ScratchBlocks.ProcedureUtils.updateDisplay_,

  // Exist on all three blocks, but have different implementations.
  mutationToDom: Blockly.ScratchBlocks.ProcedureUtils.definitionMutationToDom,
  domToMutation: Blockly.ScratchBlocks.ProcedureUtils.definitionDomToMutation,
  populateArgument_: Blockly.ScratchBlocks.ProcedureUtils.populateArgumentOnDeclaration_,
  addProcedureLabel_: Blockly.ScratchBlocks.ProcedureUtils.addLabelEditor_,

  // Exist on declaration and arguments editors, with different implementations.
  removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeFieldCallback,
  shiftFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.shiftFieldCallback,

  // Only exist on procedures_declaration.
  createArgumentEditor_: Blockly.ScratchBlocks.ProcedureUtils.createArgumentEditor_,
  focusLastEditor_: Blockly.ScratchBlocks.ProcedureUtils.focusLastEditor_,
  getSelectedInputIndex_: Blockly.ScratchBlocks.ProcedureUtils.getSelectedInputIndex_,
  finishAddingInput_: Blockly.ScratchBlocks.ProcedureUtils.finishAddingInput_,
  getUniqueArgumentName_: Blockly.ScratchBlocks.ProcedureUtils.getUniqueArgumentName_,
  getWarp: Blockly.ScratchBlocks.ProcedureUtils.getWarp,
  setWarp: Blockly.ScratchBlocks.ProcedureUtils.setWarp,
  getGlobal: Blockly.ScratchBlocks.ProcedureUtils.getGlobal,
  setGlobal: Blockly.ScratchBlocks.ProcedureUtils.setGlobal,
  addLabelExternal: Blockly.ScratchBlocks.ProcedureUtils.addLabelExternal,
  addBooleanExternal: Blockly.ScratchBlocks.ProcedureUtils.addBooleanExternal,
  addObjectExternal: Blockly.ScratchBlocks.ProcedureUtils.addObjectExternal,
  addArrayExternal: Blockly.ScratchBlocks.ProcedureUtils.addArrayExternal,
  addStatementExternal: Blockly.ScratchBlocks.ProcedureUtils.addStatementExternal,
  addStringNumberExternal: Blockly.ScratchBlocks.ProcedureUtils.addStringNumberExternal,
  addDropdownExternal: Blockly.ScratchBlocks.ProcedureUtils.addDropdownExternal,
  onChangeFn: Blockly.ScratchBlocks.ProcedureUtils.updateDeclarationProcCode_,
  // For colour fixing of the fields when on the GUI side look at the GUI!!!.
};

// marker
/** @this Blockly.Block */
function argumentReporterMutationToDom() {
 if (!this.rendered || this.isShadow_) return document.createElement('mutation'); // Don't save the colour if we are a shadow.
 return Blockly.ColourMutation.mutationToDom.call(this, Blockly.Colours.more);
}
/** @this Blockly.Block */
function argumentReporterDomToMutation(node) {
  if (this.isShadow_) return null; // Don't apply the colour if we are a shadow.
  return Blockly.ColourMutation.domToMutation.call(this, node);
}

Blockly.Blocks['argument_reporter_boolean'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_serializable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "output_boolean"]
    });
  },
  mutationToDom: argumentReporterMutationToDom,
  domToMutation: argumentReporterDomToMutation
};

Blockly.Blocks['argument_reporter_object'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_serializable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "output_object"]
    });
  },
  mutationToDom: argumentReporterMutationToDom,
  domToMutation: argumentReporterDomToMutation
};

Blockly.Blocks['argument_reporter_array'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_serializable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "output_array"]
    });
  },
  mutationToDom: argumentReporterMutationToDom,
  domToMutation: argumentReporterDomToMutation
};

Blockly.Blocks['argument_reporter_string_number'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_serializable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "output_number", "output_string"]
    });
  },
  mutationToDom: argumentReporterMutationToDom,
  domToMutation: argumentReporterDomToMutation
};

Blockly.Blocks['argument_reporter_statement'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_serializable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "shape_statement"]
    });
    this.setPreviousStatement(true, ['argumentReporterCommand', 'normal']);
    this.setNextStatement(true, ['argumentReporterCommand', 'normal']);
  },
  mutationToDom: argumentReporterMutationToDom,
  domToMutation: argumentReporterDomToMutation
};

Blockly.Blocks['argument_editor_boolean'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "foo"
        }
      ],
      "extensions": ["colours_more", "output_boolean"]
    });
    this.getField('TEXT').setValidator(
        Blockly.ScratchBlocks.ProcedureUtils.argumentNameValidator_);
  },
  // Exist on declaration and arguments editors, with different implementations.
  removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_,
  shiftFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.shiftFieldCallback
};

Blockly.Blocks['argument_editor_object'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "foo"
        }
      ],
      "extensions": ["colours_more", "output_object"]
    });
    this.getField('TEXT').setValidator(
        Blockly.ScratchBlocks.ProcedureUtils.argumentNameValidator_);
  },
  // Exist on declaration and arguments editors, with different implementations.
  removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_,
  shiftFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.shiftFieldCallback
};

Blockly.Blocks['argument_editor_array'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "foo"
        }
      ],
      "extensions": ["colours_more", "output_array"]
    });
    this.getField('TEXT').setValidator(
        Blockly.ScratchBlocks.ProcedureUtils.argumentNameValidator_);
  },
  // Exist on declaration and arguments editors, with different implementations.
  removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_,
  shiftFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.shiftFieldCallback
};

Blockly.Blocks['argument_editor_statement'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "foo"
        }
      ],
      "extensions": ["colours_more", "shape_statement"]
    });
    this.getField('TEXT').setValidator(
        Blockly.ScratchBlocks.ProcedureUtils.argumentNameValidator_);
  },
  // Exist on declaration and arguments editors, with different implementations.
  removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_,
  shiftFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.shiftFieldCallback
};

Blockly.Blocks['argument_editor_string_number'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "foo"
        }
      ],
      "extensions": ["colours_more", "output_number", "output_string"]
    });
    this.getField('TEXT').setValidator(
        Blockly.ScratchBlocks.ProcedureUtils.argumentNameValidator_);
  },
  // Exist on declaration and arguments editors, with different implementations.
  removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_,
  shiftFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.shiftFieldCallback
};

Blockly.Blocks['argument_editor_dropdown'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_dropdowneditor",
          "name": "TEXT",
          "options": [
            ['Option', 'Option']
          ]
        }
      ],
      "extensions": ["colours_more", "output_number", "output_string"]
    });
    this.getField('TEXT').setValidator(
        Blockly.ScratchBlocks.ProcedureUtils.argumentNameValidator_);
  },
  // Exist on declaration and arguments editors, with different implementations.
  removeFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.removeArgumentCallback_,
  shiftFieldCallback: Blockly.ScratchBlocks.ProcedureUtils.shiftFieldCallback
};

Blockly.Blocks['procedures_set_param'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.PROCEDURES_SET_PARAM,
      "args0": [
        {
          "type": "input_value",
          "name": "PARAM"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['procedures_return'] = {
  /**
   * Point towards drop-down menu.
   * @this Blockly.Block
  */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.PROCEDURES_RETURN,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "extensions": ["colours_more", "shape_end"]
    });
  }
};

Blockly.Blocks['procedures_dropdown'] = {
  /**
   * A custom dropdown shadow for blocks
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DROPDOWN_VALUE",
          "options": [
            ['', '']
          ]
        }
      ],
      "extensions": ["colours_more", "output_string"]
    });
  }
}
