/**
 * @fileoverview Field that contains other inputs and can be extended.
 * @author CST1229
 */
'use strict';

goog.provide('Blockly.FieldExtendable');

goog.require('Blockly.Field');


/**
 * Class for an extendable field.
 * @param {!Array} elements Array of arguments to use for each extendable input, in the jsonInit format.
 * @param {!number} defaultInputs Default number of inputs
 * @param {!number} minInputs Minimum inputs
 * @param {!number} maxInputs Maximum inputs
 * @param {!Array} separator Array of arguments to use as a separator
 * @param {!Array} collapser Array of arguments to use with 0 inputs
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldExtendable = function(elements, defaultInputs, minInputs, maxInputs, separator, collapser) {
  this.size_ = new goog.math.Size(Blockly.FieldExtendable.ARROW_HEIGHT, Blockly.FieldExtendable.ARROW_WIDTH * 2);

  this.elements = elements;
  this.minInputs = minInputs;
  this.maxInputs = maxInputs;
  this.separator = separator;
  this.collapser = collapser;

  this.lastInputRow = undefined;

  /** @type {boolean} */
  this.disabled = false;
  this.inputs = undefined;
  this.defaultInputs = defaultInputs;
  this.firstTimeAddingInputs = true;

  this.addArgType('extendable');
  
  this.maxDisplayLength = Blockly.BlockSvg.MAX_DISPLAY_LENGTH;
};
goog.inherits(Blockly.FieldExtendable, Blockly.Field);

Blockly.FieldExtendable.prototype.insertedInto = function(_input, _block) {
  this.setValue(this.defaultInputs, false);

  this.disabled = this.sourceBlock_.isInFlyout;
};

/**
 * Construct a FieldExtendable from a JSON arg object.
 * @param {!Object} options A JSON object with options (checked).
 * @returns {!Blockly.FieldExtendable} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldExtendable.fromJson = function(options) {
  var args = options.args;
  if (args === undefined) args = [];
  var defaultInputs = options.defaultInputs;
  if (defaultInputs === undefined) defaultInputs = 0;
  var minInputs = options.minInputs;
  if (minInputs === undefined) minInputs = 0;
  var maxInputs = options.maxInputs;
  if (maxInputs === undefined) maxInputs = Infinity;
  var separator = options.separator;
  if (separator === undefined) separator = [];
  if (!Array.isArray(separator)) separator = [separator];
  var collapser = options.collapser;
  if (collapser === undefined) collapser = [];
  if (!Array.isArray(collapser)) collapser = [collapser];
  return new Blockly.FieldExtendable(args, defaultInputs, minInputs, maxInputs, separator, collapser);
};

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldExtendable.prototype.CURSOR = 'default';
Blockly.FieldExtendable.prototype.EDITABLE = true;
Blockly.FieldExtendable.prototype.REVERSE_SERIALIZE = true;
/**
 * Field name separator.
 */
Blockly.FieldExtendable.prototype.SEP = "_";

Blockly.FieldExtendable.ARROW_WIDTH = 16;
Blockly.FieldExtendable.ARROW_HEIGHT = 32;
Blockly.FieldExtendable.ARROW_LEFT_PATH = 'icons/extendable_arrow_left.svg';
Blockly.FieldExtendable.ARROW_RIGHT_PATH = 'icons/extendable_arrow_right.svg';

/**
 * Install this field on a block.
 */
Blockly.FieldExtendable.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  /** @type {SVGElement} */
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  this.arrowLeft = Blockly.utils.createSvgElement('image',
      {
        'height': Blockly.FieldExtendable.ARROW_HEIGHT + 'px',
        'width': Blockly.FieldExtendable.ARROW_WIDTH + 'px'
      },
      this.fieldGroup_
  );
  this.arrowRight = Blockly.utils.createSvgElement('image',
      {
        'height': Blockly.FieldExtendable.ARROW_HEIGHT + 'px',
        'width': Blockly.FieldExtendable.ARROW_WIDTH + 'px',
        'x': Blockly.FieldExtendable.ARROW_WIDTH
      },
      this.fieldGroup_
  );
  this.arrowLeft.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.mainWorkspace.options.pathToMedia + Blockly.FieldExtendable.ARROW_LEFT_PATH
  );
  this.arrowRight.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.mainWorkspace.options.pathToMedia + Blockly.FieldExtendable.ARROW_RIGHT_PATH
  );
  if (!this.disabled) this.arrowLeft.style.cursor = 'pointer';
  if (!this.disabled) this.arrowRight.style.cursor = 'pointer';

  this.mouseDownWrapperLeftDown_ = Blockly.bindEventWithChecks_(
      this.arrowLeft, 'mousedown', this, this.onMouseDown_
  );
  this.mouseDownWrapperRightDown_ = Blockly.bindEventWithChecks_(
      this.arrowRight, 'mousedown', this, this.onMouseDown_
  );
  this.mouseDownWrapperLeft_ = Blockly.bindEventWithChecks_(
      this.arrowLeft, 'mouseup', this, (ev) => this.onClick(-1, ev)
  );
  this.mouseDownWrapperRight_ = Blockly.bindEventWithChecks_(
      this.arrowRight, 'mouseup', this, (ev) => this.onClick(1, ev)
  );

  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);

  this.render_();
};

/**
 * @return {number} Number of inputs, as a string.
 */
Blockly.FieldExtendable.prototype.getValue = function() {
  return String(this.inputs);
};

/**
 * Get the prefix used for inputs.
 * @return {string} The prefix.
 */
Blockly.FieldExtendable.prototype.getPrefix = function() {
  return String(this.name || "") + this.SEP;
};

/**
 * Get the absolute name of an extendable input from its index.
 * @param {number | string} id The index of the input.
 * @param {string=} opt_midfix An optional string to add after the prefix.
 * @return {string} The final name of the input.
 */
Blockly.FieldExtendable.prototype.getInputName = function(id, opt_midfix) {
  if (opt_midfix) {
    return this.getPrefix() + opt_midfix + String(id);
  }
  return this.getPrefix() + String(id);
};

/**
 * Get the absolute name of an extendable input from its index.
 * @param {Array} elements Elements to add.
 * @param {string} midfix A string to add after the prefix.
 * @param {number} inputIndex The index to start appending inputs to in the block.
 * @param {number | string} extendableIndex The extendable input index.
 * @param {boolean=} populate If true, default input_values shadows will automatically be populated.
 * @return {number} The shifted input index after the inputs were added.
 */
Blockly.FieldExtendable.prototype.appendArgsList = function(elements, midfix, inputIndex, extendableIndex, populate) {
  this.lastInputRow = inputIndex;
  if (!elements.length) return inputIndex;
  var addedInputs = this.sourceBlock_.appendArgsList(
      elements, {
        position: inputIndex,
        returnInputs: true,
        namePrefix: this.getInputName(extendableIndex, midfix) + this.SEP,
        populate: populate,
        isExtendable: true
      }
  );
  for (var j = 0; j < addedInputs.length; j++) {
    var input = addedInputs[j];
    input.extendableName = this.name;
    input.extendableIndex = extendableIndex;
  }
  this.lastInputRow = inputIndex + addedInputs.length;
  return inputIndex + addedInputs.length;
};

/**
 * Set the amount of inputs.
 * @param {number | string} newValue Number of inputs.
 * @param {boolean=} opt_force If true, ignores the set min/max values.
 * @param {boolean=} opt_noRender If true, skips rerendering.
 */
Blockly.FieldExtendable.prototype.setValue = function(newValue, opt_force, opt_noRender) {
  var newInputs = +newValue;
  if (!opt_force) {
    if (newInputs < this.minInputs) newInputs = this.minInputs;
    else if (newInputs > this.maxInputs) newInputs = this.maxInputs;
  }
  
  if (this.inputs !== newInputs) {
    var shouldPopulate = this.sourceBlock_ && (this.sourceBlock_.rendered || this.sourceBlock_.isInFlyout);
    if (this.inputs === undefined) this.inputs = 0;
    if (this.sourceBlock_) {
      // If we decreased the number of inputs, remove some
      if (newInputs < this.inputs) {
        var inputList = this.sourceBlock_.inputList;
        var sb = this.sourceBlock_;
        for (var i = inputList.length - 1; i >= 0; i--) {
          var input = inputList[i];
          if (input && input.extendableName == this.name && input.extendableIndex >= newInputs) {
            sb.removeNumberedInput(i);
          }
        }
      }
      // If we increased the number of inputs, add some
      var thisIndex = this.sourceBlock_.inputList.indexOf(this.sourceInput_);
      for (var i = this.inputs; i < newInputs; i++) {
        // Add separator for inputs after the first
        if (i > 0 && this.separator.length) {
          thisIndex = this.appendArgsList(
              this.separator, "SEP", thisIndex, i, shouldPopulate
          );
        }
        thisIndex = this.appendArgsList(
            this.elements, "", thisIndex, i, shouldPopulate
        );
      }
      
      if (newInputs === 0 && this.inputs !== 0) {
        // Add collapser if needed
        thisIndex = this.appendArgsList(
            this.collapser, "", thisIndex, "COLLAPSER", shouldPopulate
        );
      } else if (newInputs !== 0 && this.inputs === 0) {
        // Or remove it
        for (var i = this.sourceBlock_.inputList.length - 1; i >= 0; i--) {
          var input = this.sourceBlock_.inputList[i];
          if (input && input.extendableName == this.name && input.extendableIndex == "COLLAPSER") {
            this.sourceBlock_.removeNumberedInput(i);
          }
        }
      }

      if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockChange(
            this.sourceBlock_, 'field', this.name, this.inputs, newInputs));
      }
    }

    this.inputs = newInputs;
    if (!opt_noRender) {
      this.render_();
      if (this.sourceBlock_ && this.sourceBlock_.rendered) {
        this.sourceBlock_.initSvg();
        this.sourceBlock_.render();
      }
    }
  } else if (this.sourceBlock_) {
    if (newInputs === 0 && this.firstTimeAddingInputs) {
      // Add collapser on first block creation
      var thisIndex = this.sourceBlock_.inputList.indexOf(this.sourceInput_);
      thisIndex = this.appendArgsList(
          this.collapser, "", thisIndex, "COLLAPSER", shouldPopulate
      );
    }
  }
  this.firstTimeAddingInputs = false;
};

/**
 * @param {number} inputs Number of inputs to add.
 * @param {MouseEvent=} ev An optional mouse event.
 */
Blockly.FieldExtendable.prototype.onClick = function(inputs, ev) {
  if (this.disabled || !this.isCurrentlyEditable()) return;
  if (this.sourceBlock_ && this.sourceBlock_.workspace &&
      this.sourceBlock_.workspace.isDragging()) return;
  this.setValue(this.inputs + (inputs * (ev && ev.shiftKey ? 3 : 1)));
};

/**
 * This field is editable, but only through the extra buttons it adds.
 * @private
 */
Blockly.FieldExtendable.prototype.showEditor_ = function() {
  // nop.
};

/**
 * @param {number} inputs Number of inputs to add.
 */
Blockly.FieldExtendable.prototype.addInputs = function(inputs) {
  this.setValue(this.inputs + inputs);
};

Blockly.FieldExtendable.prototype.render_ = function() {
  this.updateWidth();
  if (!this.arrowLeft) return;
  this.arrowLeft.style.display = this.inputs <= this.minInputs ? 'none' : '';
  this.arrowRight.style.display = this.inputs >= this.maxInputs ? 'none' : '';
  this.arrowRight.setAttribute('x', this.inputs <= this.minInputs ? '0px' : Blockly.FieldExtendable.ARROW_WIDTH + 'px');
};

Blockly.FieldExtendable.prototype.updateWidth = function() {
  if (this.inputs <= this.minInputs || this.inputs >= this.maxInputs) {
    this.size_.width = Blockly.FieldExtendable.ARROW_WIDTH;
  } else {
    this.size_.width = Blockly.FieldExtendable.ARROW_WIDTH * 2;
  }
};

Blockly.FieldExtendable.prototype.dispose = function() {
  // Dispose of any inputs added by this field
  if (this.sourceBlock_) {
    for (var i = this.sourceBlock_.inputList.length - 1; i >= 0; i--) {
      var input = this.sourceBlock_.inputList[i];
      if (input && input.sourceBlock_ && input.extendableName == this.name) {
        this.sourceBlock_.removeNumberedInput(i);
      }
    }
  }
  if (this.mouseDownWrapperLeft_) {
    Blockly.unbindEvent_(this.mouseDownWrapperLeft_);
  }
  if (this.mouseDownWrapperRight_) {
    Blockly.unbindEvent_(this.mouseDownWrapperRight_);
  }
  if (this.mouseDownWrapperLeftDown_) {
    Blockly.unbindEvent_(this.mouseDownWrapperLeftDown_);
  }
  if (this.mouseDownWrapperRightDown_) {
    Blockly.unbindEvent_(this.mouseDownWrapperRightDown_);
  }
  Blockly.FieldExtendable.superClass_.dispose.call(this);
};

Blockly.Field.register('extendable', Blockly.FieldExtendable);
