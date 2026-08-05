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
 * @fileoverview Checkbox field.  Checked or not checked.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

// "super cool staircase" - Cubester & Miyo
goog.provide('Blockly.FieldCheckbox');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.Events.BlockMove');

goog.require('Blockly.Field');

goog.require('Blockly.Xml');


/**
 * Class for a checkbox field.
 *   Internally repurposed as a display.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldCheckbox = function(optArg) {
  Blockly.FieldCheckbox.superClass_.constructor.call(this, ' ');
  if (optArg) {
    // Support other mod's that use this field.
    optArg = String(optArg).toLowerCase();
    if (optArg == 'true') {/* no-op */}
    else if (optArg == 'false') {
      this._alternateSupport = true;
    }
  }
  this.addArgType('checkbox');
};
goog.inherits(Blockly.FieldCheckbox, Blockly.Field);

/**
 * Marker boolean set by the constructor for if we are detecting other,
 * mod's that may use this field. This is done so that we don't break
 * anyone's projects by making a fields usage completely different
 * like we do.
 * @type {boolean}
 * @private
 */
Blockly.FieldCheckbox.prototype._alternateSupport = false;

/**
 * Connect's a checkbox shadow to the specified input.
 * @param {Blockly.Input} input The boolean input to connect too.
 * This is used by block_svg_render_vertical to add swap the checkbox state on boolean values.
 */
Blockly.FieldCheckbox.connectBoolean = function(input) {
  Blockly.Events.setGroup(true);
  var block = Blockly.Xml.domToBlock(
    Blockly.Xml.textToDom('<xml><shadow type="checkbox"><field name="CHECKBOX"> </field></shadow></xml>').querySelector('shadow'),
    input.sourceBlock_.workspace
  );
  block.outputConnection.connect(input.connection);
  Blockly.Events.setGroup(false);
};

/**
 * Construct a FieldCheckbox from a JSON arg object.
 * @returns {!Blockly.FieldCheckbox} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldCheckbox.fromJson = function(options) {
  if (options.checked !== (void 0)) {
    console.warn('The "checked" option is deprecated.');
  }
  return new Blockly.FieldCheckbox(options.checked);
};

/**
 * Icon for the checkmark.
 */
Blockly.FieldCheckbox.CHECKMARK = 'M -4.5 1.5 A 1 1 90 0 1 -2.5 -0.5 L -1.5 0.5 L 2.5 -3.5 A 1 1 0 0 1 4.5 -1.5 L -0.5 3.5 Q -1.5 4.5 -2.5 3.5 Z';

/**
 * Icon for the cross mark.
 */
Blockly.FieldCheckbox.CROSS = 'M -2.5 -4.5 A 1 1 0 0 0 -4.5 -2.5 L -2 0 L -4.5 2.5 A 1 1 0 0 0 -2.5 4.5 L 0 2 L 2.5 4.5 A 1 1 0 0 0 4.5 2.5 L 2 0 L 4.5 -2.5 A 1 1 0 0 0 2.5 -4.5 L 0 -2 Z';

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldCheckbox.prototype.CURSOR = 'pointer';

/**
 * Install this checkbox on a block.
 */
Blockly.FieldCheckbox.prototype.init = function() {
  if (this.fieldGroup_) {
    // Checkbox has already been initialized once.
    return;
  }
  Blockly.FieldCheckbox.superClass_.init.call(this);
  // The checkbox doesn't use the inherited text element.
  // Instead it uses a custom checkmark element that is either visible or not.
  this.render_(); // Rerender
  this.checkElement_ = Blockly.utils.createSvgElement('path', {
    'class': 'blocklyText',
    'transform': `translate(${this.textElement_.getAttribute('x')},${this.textElement_.getAttribute('y') - 2}) scale(1.5)`,
    'd': Blockly.FieldCheckbox.CHECKMARK
  }, this.fieldGroup_);
  this.textElement_.after(this.checkElement_);
  // We have to wait for all the other stuff to finish before doing the following.
  // If we detect another mod / old use of the field then we should instantly
  // remove ourselves from our parent block, we already know if it's true we should
  // stay in our parent block.
  if (this._alternateSupport) {
    if (window.queueMicrotask) {
      queueMicrotask(this.showEditor_.bind(this));
    } else {
      Promise.resolve().then(this.showEditor_.bind(this));
    }
  }
};

/**
 * Make sure if we are set to a form of false to kill ourselves.
 * @param {any} value The new value.
 */
Blockly.FieldCheckbox.prototype.setValue = function(value) {
  if (value === false || String(value).toLowerCase() == 'false') {
    this._alternateSupport = true; // Just incase we are not initialized set this to true.
    if (this.fieldGroup_) this.showEditor_(); // If we have initialized then perform the removal action.
    return;
  } else if (value === true || String(value).toLowerCase() == 'true') {
    value = ' '; // The right TRUE value for this field.
  }
  return Blockly.FieldCheckbox.superClass_.setValue.call(this, value);
};

/**
 * Toggle the state of the checkbox.
 * @private
 */
Blockly.FieldCheckbox.prototype.showEditor_ = function() {
  Blockly.Events.setGroup(true);
  var source = this.sourceBlock_;
  this.dispose(); // Dispose of the field.
  var input = source && source.getParent() && source.getParent().getInputWithBlock(source);
  // Make sure we have a parent and are in an input, otherwise something.. weird is going on.
  if (!source || !input) {
    Blockly.Events.setGroup(false);
    console.warn('Orphaned checkbox field was clicked.');
    return;
  }
  // Remove the shadow dom from the connection. (to prevent regeneration)
  input.connection.setShadowDom();
  // Un-shadow the block so the VM will properly delete it.
  source.setShadow(false);
  // Dispose of our shadow parent.
  source.unplug(false);
  source.dispose(false, false);
  Blockly.Events.setGroup(false);
};

Blockly.FieldCheckbox.prototype.updateWidth = function() {
  Blockly.FieldCheckbox.superClass_.updateWidth.call(this);
  this.size_.width = 8 * Blockly.BlockSvg.GRID_UNIT;
};

Blockly.Field.register('field_checkbox', Blockly.FieldCheckbox);
