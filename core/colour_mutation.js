/**
 * @fileoverview Provides reusable colour dom mutation functions.
 */

'use strict';

goog.provide('Blockly.ColourMutation');

goog.require('goog.color');

/** @const {object} Blockly.ColourMutation */
var cm = {
  PRIMARY: 'colourmutprimary',
  SECONDARY: 'colourmutsecondary',
  TERTIARY: 'colourmuttertiary',
  QUATERNARY: 'colourmutquaternary'
};
Blockly.ColourMutation = cm;

/**
 * Generates a mutation node from the current block.
 * @param {object} cols Default colours.
 * @returns {Node} The mutation.
 * @this Blockly.Block
 */
Blockly.ColourMutation.mutationToDom = function(cols) {
  /** @const {Node} */
  var mutation = document.createElement('mutation');
  if (this.colour_ !== cols.primary && this.colour_)
    mutation.setAttribute(cm.PRIMARY, this.colour_);
  if (this.colourSecondary_ !== cols.secondary && this.colourSecondary_)
    mutation.setAttribute(cm.SECONDARY, this.colourSecondary_);
  if (this.colourTertiary_ !== cols.tertiary && this.colourTertiary_)
    mutation.setAttribute(cm.TERTIARY, this.colourTertiary_);
  if (this.colourQuaternary_ !== cols.quaternary && this.colourQuaternary_)
    mutation.setAttribute(cm.QUATERNARY, this.colourQuaternary_);
  return mutation;
};

/**
 * Apply's the colours from the mutation node to the current block.
 * @param {Node} node Them mutation object.
 * @param {?boolean} skipApply Skip's running setColour, you can use this to prevent a rerender.
 * @returns {string[]} The new colours.
 * @this Blockly.Block
 */
Blockly.ColourMutation.domToMutation = function(node, skipApply) {
  /** @const {string[]} */
  var colours = [this.colour_, this.colourSecondary_, this.colourTertiary_, this.colourQuaternary_];
  if (node.hasAttribute(cm.PRIMARY) && goog.color.isValidHexColor_(node.getAttribute(cm.PRIMARY)))
    colours[0] = node.getAttribute(cm.PRIMARY);
  if (node.hasAttribute(cm.SECONDARY) && goog.color.isValidHexColor_(node.getAttribute(cm.SECONDARY)))
    colours[1] = node.getAttribute(cm.SECONDARY);
  if (node.hasAttribute(cm.TERTIARY) && goog.color.isValidHexColor_(node.getAttribute(cm.TERTIARY)))
    colours[2] = node.getAttribute(cm.TERTIARY);
  if (node.hasAttribute(cm.QUATERNARY) && goog.color.isValidHexColor_(node.getAttribute(cm.QUATERNARY)))
    colours[3] = node.getAttribute(cm.QUATERNARY);
  if (!skipApply) this.setColour(...colours);
  return colours;
};
