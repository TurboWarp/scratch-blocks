/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 */

'use strict';

goog.provide('Blockly.Blocks.complex');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

Blockly.Blocks['operator_complex_create'] = {
  /**
   * Block for creating a complex number.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "complex %1 + %2 i",
      "args0": [
        {
          "type": "input_value",
          "name": "RE"
        },
        {
          "type": "input_value",
          "name": "IM"
        }
      ],
      "category": Blockly.Categories.complex,
      "extensions": ["colours_complex", "output_string"]
    });
  }
};

Blockly.Blocks['operator_complex_add'] = {
  /**
   * Block for adding two complex numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 + %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A"
        },
        {
          "type": "input_value",
          "name": "B"
        }
      ],
      "category": Blockly.Categories.complex,
      "extensions": ["colours_complex", "output_string"]
    });
  }
};
