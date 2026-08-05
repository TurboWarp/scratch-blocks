/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
 * @fileoverview Text input field with floating "remove" button.
 * @author pkaplan@media.mit.edu (Paul Kaplan)
 */
'use strict';

goog.provide('Blockly.FieldTextInputRemovable');

goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Colours');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('goog.dom');
goog.require('goog.dom.TagName');

/**
 * Class for an editable text field displaying a deletion icon when selected.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {RegExp=} opt_restrictor An optional regular expression to restrict
 *     typed text to. Text that doesn't match the restrictor will never show
 *     in the text field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldTextInputRemovable = function(text, opt_validator, opt_restrictor) {
  Blockly.FieldTextInputRemovable.superClass_.constructor.call(this, text,
      opt_validator, opt_restrictor);
};
goog.inherits(Blockly.FieldTextInputRemovable, Blockly.FieldTextInput);

Blockly.FieldTextInputRemovable.prototype.init = function() {
  Blockly.FieldTextInputRemovable.superClass_.init.call(this);

  this.textElement_.classList.add('removableTextInput');
};

/**
 * Reject empty removable text fields. Procedure labels and argument names use
 * this field, and an empty value causes the declaration rebuild to remove them.
 * @param {string} text The proposed field text.
 * @return {?string} The text, or null when it is empty or whitespace-only.
 */
Blockly.FieldTextInputRemovable.prototype.classValidator = function(text) {
  var validated = Blockly.FieldTextInputRemovable.superClass_.classValidator.
      call(this, text);
  if (validated === null || !validated || !validated.trim()) {
    return null;
  }
  return validated;
};

/**
 * Show the inline free-text editor on top of the text with the remove button.
 * @private
 */
Blockly.FieldTextInputRemovable.prototype.showEditor_ = function() {
  Blockly.FieldTextInputRemovable.superClass_.showEditor_.call(this);

  // Remember the active procedure input so newly added inputs can be inserted
  // immediately after it. Argument editors are children of the declaration;
  // label editors live on the declaration itself.
  if (this.sourceBlock_) {
    var declaration = this.sourceBlock_.parentBlock_ || this.sourceBlock_;
    if (declaration.type == 'procedures_declaration') {
      declaration.selectedField_ = this;
    }
  }

  var div = Blockly.WidgetDiv.DIV;
  div.className += ' removableTextInput';
  var removeButton =
      goog.dom.createDom(goog.dom.TagName.IMG, 'blocklyTextRemoveIcon');
  removeButton.setAttribute('src',
      Blockly.mainWorkspace.options.pathToMedia + 'icons/remove.svg');
  this.removeButtonMouseWrapper_ = Blockly.bindEvent_(removeButton,
      'mousedown', this, this.removeCallback_);
  div.appendChild(removeButton);

  if (this.sourceBlock_ && this.sourceBlock_.shiftFieldCallback) {
    this.shiftButtonMouseWrappers_ = [-1, 1].map(function(direction) {
      var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrow.setAttribute('class', 'blocklyTextShiftArrow');
      arrow.setAttribute('viewBox', '0 0 20 40');
      arrow.style.left = direction < 0 ?
        'calc(50% - 40px)' : 'calc(50% + 20px)';
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', direction < 0 ?
        'M 17 11 L 8 20 L 17 29' : 'M 3 11 L 12 20 L 3 29');
      arrow.appendChild(path);
      div.appendChild(arrow);
      return Blockly.bindEvent_(arrow, 'mousedown', this, function(event) {
        event.preventDefault();
        this.sourceBlock_.shiftFieldCallback(this, direction);
      });
    }, this);
  }
};

/**
 * Close the editor and clear its procedure declaration selection.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTextInputRemovable.prototype.widgetDispose_ = function() {
  var dispose = Blockly.FieldTextInputRemovable.superClass_.widgetDispose_.
      call(this);
  var thisField = this;
  return function() {
    dispose();
    if (!thisField.sourceBlock_) {
      return;
    }
    var declaration = thisField.sourceBlock_.parentBlock_ ||
        thisField.sourceBlock_;
    if (declaration.type == 'procedures_declaration' &&
        declaration.selectedField_ == thisField) {
      declaration.selectedField_ = null;
    }
  };
};

/**
 * Return the editor anchor position. A statement argument uses the statement
 * block's horizontal bounds but the field row's vertical bounds, keeping the
 * editor centered over the header instead of the C-shaped block body.
 * @return {!goog.math.Coordinate} Page coordinates for the editor.
 * @private
 */
Blockly.FieldTextInputRemovable.prototype.getAbsoluteXY_ = function() {
  if (this.sourceBlock_ &&
      this.sourceBlock_.type == 'argument_editor_statement') {
    var fieldRect = this.getSvgRoot().getBoundingClientRect();
    var scale = this.sourceBlock_.workspace.scale;
    var headerWidth = (this.size_.width +
        2 * Blockly.BlockSvg.SEP_SPACE_X) * scale;
    return {
      x: fieldRect.left + window.pageXOffset +
          (fieldRect.width - headerWidth) / 2,
      y: fieldRect.top + window.pageYOffset +
          (fieldRect.height -
          Blockly.BlockSvg.FIELD_HEIGHT_MAX_EDIT * scale) / 2
    };
  }
  return Blockly.FieldTextInputRemovable.superClass_.getAbsoluteXY_.call(this);
};

/**
 * Function to call when remove button is called. Checks for removeFieldCallback
 * on sourceBlock and calls it if possible.
 * @private
 */
Blockly.FieldTextInputRemovable.prototype.removeCallback_ = function() {
  if (this.sourceBlock_ && this.sourceBlock_.removeFieldCallback) {
    this.sourceBlock_.removeFieldCallback(this);
  } else {
    console.warn('Expected a source block with removeFieldCallback');
  }
};

/**
 * Helper function to construct a FieldTextInputRemovable from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @returns {!Blockly.FieldTextInputRemovable} The new text input.
 * @public
 */
Blockly.FieldTextInputRemovable.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldTextInputRemovable(text, options['class']);
  if (typeof options['spellcheck'] == 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

Blockly.Field.register(
    'field_input_removable', Blockly.FieldTextInputRemovable);
