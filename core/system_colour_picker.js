'use strict';

goog.provide('Blockly.SystemColourPicker');

/**
 * Place a native colour input over an SVG paintbrush icon.
 * @param {!Element} anchor Paintbrush icon.
 * @param {!Function} getColour Returns the current colour.
 * @param {!Function} callback Called with the selected colour.
 * @return {!Element} The SVG foreignObject containing the native input.
 */
Blockly.SystemColourPicker.attach = function(anchor, getColour, callback) {
  var control = document.createElementNS('http://www.w3.org/2000/svg',
      'foreignObject');
  control.setAttribute('width', anchor.getAttribute('width'));
  control.setAttribute('height', anchor.getAttribute('height'));
  control.setAttribute('x', anchor.getAttribute('x') || 0);
  control.setAttribute('y', anchor.getAttribute('y'));
  anchor.parentNode.appendChild(control);
  var input = document.createElementNS('http://www.w3.org/1999/xhtml', 'input');
  input.type = 'color';
  input.style.width = '100%';
  input.style.height = '100%';
  input.style.opacity = '0';
  input.style.cursor = 'pointer';
  input.style.margin = '0';
  input.style.padding = '0';
  input.style.border = '0';
  control.appendChild(input);
  input.addEventListener('mousedown', function(e) {
    input.value = getColour() || '#fef49c';
    e.stopPropagation();
  });
  input.addEventListener('input', function() {
    callback(input.value);
  });
  input.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  return control;
};

/**
 * Check whether a hex colour needs light foreground text.
 * @param {?string} colour Background colour in #rrggbb format.
 * @return {boolean} Whether white text should be used.
 */
Blockly.SystemColourPicker.isDark = function(colour) {
  var match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(colour || '');
  if (!match) return false;
  var brightness = (299 * parseInt(match[1], 16) +
      587 * parseInt(match[2], 16) + 114 * parseInt(match[3], 16)) / 1000;
  return brightness < 128;
};
