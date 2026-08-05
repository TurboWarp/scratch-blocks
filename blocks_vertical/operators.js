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

'use strict';

goog.provide('Blockly.Blocks.operators');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['operator_add'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_ADD,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "switches": ["operator_subtract", "operator_multiply", "operator_divide", 'operator_mod'],
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_subtract'] = {
  /**
   * Block for subtracting two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_SUBTRACT,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "switches": ["operator_add", "operator_multiply", "operator_divide", 'operator_mod'],
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_multiply'] = {
  /**
   * Block for multiplying two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MULTIPLY,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "switches": ["operator_add", "operator_subtract", "operator_divide", 'operator_mod'],
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_divide'] = {
  /**
   * Block for dividing two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_DIVIDE,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "switches": ["operator_add", "operator_subtract", "operator_multiply", 'operator_mod'],
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_random'] = {
  /**
   * Block for picking a random number.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_RANDOM,
      "args0": [
        {
          "type": "input_value",
          "name": "FROM"
        },
        {
          "type": "input_value",
          "name": "TO"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_lt'] = {
  /**
   * Block for less than comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LT,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "category": Blockly.Categories.operators,
      "switches": [
        'operator_gt',
        'operator_equals'
      ],
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_equals'] = {
  /**
   * Block for equals comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_EQUALS,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": [
        'operator_gt',
        'operator_lt'
      ]
    });
  }
};

Blockly.Blocks['operator_gt'] = {
  /**
   * Block for greater than comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_GT,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "category": Blockly.Categories.operators,
      "switches": [
        'operator_equals',
        'operator_lt'
      ],
      "extensions": ["colours_operators", "output_boolean"],
    });
  }
};

Blockly.Blocks['operator_and'] = {
  /**
   * Block for "and" boolean comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_AND,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "OPERAND2",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": ["operator_or"]
    });
  }
};

Blockly.Blocks['operator_or'] = {
  /**
   * Block for "or" boolean comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_OR,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "OPERAND2",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": ["operator_and"]
    });
  }
};

Blockly.Blocks['operator_not'] = {
  /**
   * Block for "not" unary boolean operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_NOT,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_join'] = {
  /**
   * Block for string join operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_JOIN,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING1"
        },
        {
          "type": "input_value",
          "name": "STRING2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_string"]
    });
  }
};

Blockly.Blocks['operator_letter_of'] = {
  /**
   * Block for "letter _ of _" operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LETTEROF,
      "args0": [
        {
          "type": "input_value",
          "name": "LETTER"
        },
        {
          "type": "input_value",
          "name": "STRING"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_string"]
    });
  }
};

Blockly.Blocks['operator_letters_in'] = {
  /**
   * Block for "letters _ to _ of _" operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LETTERSIN,
      "args0": [
        {
          "type": "input_value",
          "name": "START"
        },
        {
          "type": "input_value",
          "name": "END"
        },
        {
          "type": "input_value",
          "name": "STRING"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_string"]
    });
  }
};

Blockly.Blocks['operator_length'] = {
  /**
   * Block for string length operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LENGTH,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_string"]
    });
  }
};

Blockly.Blocks['operator_contains'] = {
  /**
   * Block for _ contains _ operator
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_CONTAINS,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING1"
        },
        {
          "type": "input_value",
          "name": "STRING2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_mod'] = {
  /**
   * Block for mod two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MOD,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"],
      "switches": [
        'operator_add',
        'operator_subtract',
        'operator_multiply',
        'operator_divide'
      ]
    });
  }
};

Blockly.Blocks['operator_round'] = {
  /**
   * Block for rounding a numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_ROUND,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_mathop'] = {
  /**
   * Block for "advanced" math ops on a number.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MATHOP,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            [Blockly.Msg.OPERATORS_MATHOP_ABS, 'abs'],
            [Blockly.Msg.OPERATORS_MATHOP_FLOOR, 'floor'],
            [Blockly.Msg.OPERATORS_MATHOP_CEILING, 'ceiling'],
            [Blockly.Msg.OPERATORS_MATHOP_SQRT, 'sqrt'],
            [Blockly.Msg.OPERATORS_MATHOP_SIN, 'sin'],
            [Blockly.Msg.OPERATORS_MATHOP_COS, 'cos'],
            [Blockly.Msg.OPERATORS_MATHOP_TAN, 'tan'],
            [Blockly.Msg.OPERATORS_MATHOP_ASIN, 'asin'],
            [Blockly.Msg.OPERATORS_MATHOP_ACOS, 'acos'],
            [Blockly.Msg.OPERATORS_MATHOP_ATAN, 'atan'],
            [Blockly.Msg.OPERATORS_MATHOP_LN, 'ln'],
            [Blockly.Msg.OPERATORS_MATHOP_LOG, 'log'],
            [Blockly.Msg.OPERATORS_MATHOP_EEXP, 'e ^'],
            [Blockly.Msg.OPERATORS_MATHOP_10EXP, '10 ^']
          ]
        },
        {
          "type": "input_value",
          "name": "NUM"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_constant'] = {
  /**
   * Block for a math constant (pi, e, etc.).
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CONSTANT",
          "options": [
            ["\u03C0", "pi"],
            ["e", "e"],
            ["\u03C6", "phi"],
            ["ε", "epsilon"],
          ]
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_cast'] = {
  /**
   * Block for casting a value to a specific type.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_CAST,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        },
        {
          "type": "field_dropdown",
          "name": "TYPE",
          "options": [
            [Blockly.Msg.OPERATORS_CAST_STRING, "string"],
            [Blockly.Msg.OPERATORS_CAST_NUMBER, "number"],
            [Blockly.Msg.OPERATORS_CAST_BOOLEAN, "boolean"],
            [Blockly.Msg.OPERATORS_CAST_OBJECT, "object"],
            [Blockly.Msg.OPERATORS_CAST_ARRAY, "array"]
          ]
        }
      ],
      "output": null,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators"],
    });
  }
};

Blockly.Blocks['operator_typeof'] = {
  /**
   * Get the specific type of a value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_TYPEOF,
      args0: [
        {
          type: "input_value",
          name: "VALUE"
        }
      ],
      category: Blockly.Categories.operators,
      extensions: ["colours_operators", "output_string"]
    });
  }
};

// extendable blocks
Blockly.Blocks['operator_join_extendable'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_JOIN_EXTENDABLE,
      "args0": [
        {
          "type": "extendable",
          "name": "STRINGS",
          "args": [
            {
              "type": "input_value",
              "name": "STRING",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": Blockly.Msg.OPERATORS_JOIN_EXTENDABLE_APPLE
            },
          ],
          "minInputs": 2,
          "defaultInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_string"]
    });
  }
};

Blockly.Blocks['operator_add_extendable'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "extendable",
          "name": "NUMS",
          "args": [
            {
              "type": "input_value",
              "name": "NUM",
              "shadowOpcode": "math_number",
              "shadowFieldName": "NUM",
              "shadowFieldValue": ""
            },
          ],
          "separator": "+",
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"],
      "switches": [
        "operator_subtract_extendable",
        "operator_multiply_extendable",
        "operator_divide_extendable",
        "operator_power"
      ]
    });
  }
};
Blockly.Blocks['operator_subtract_extendable'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "extendable",
          "name": "NUMS",
          "args": [
            {
              "type": "input_value",
              "name": "NUM",
              "shadowOpcode": "math_number",
              "shadowFieldName": "NUM",
              "shadowFieldValue": ""
            },
          ],
          "separator": "-",
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"],
      "switches": [
        "operator_add_extendable",
        "operator_multiply_extendable",
        "operator_divide_extendable",
        "operator_power"
      ]
    });
  }
};
Blockly.Blocks['operator_multiply_extendable'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "extendable",
          "name": "NUMS",
          "args": [
            {
              "type": "input_value",
              "name": "NUM",
              "shadowOpcode": "math_number",
              "shadowFieldName": "NUM",
              "shadowFieldValue": ""
            },
          ],
          "separator": "*",
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"],
      "switches": [
        "operator_add_extendable",
        "operator_subtract_extendable",
        "operator_divide_extendable",
        "operator_power"
      ]
    });
  }
};
Blockly.Blocks['operator_divide_extendable'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "extendable",
          "name": "NUMS",
          "args": [
            {
              "type": "input_value",
              "name": "NUM",
              "shadowOpcode": "math_number",
              "shadowFieldName": "NUM",
              "shadowFieldValue": ""
            },
          ],
          "separator": "/",
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"],
      "switches": [
        "operator_add_extendable",
        "operator_subtract_extendable",
        "operator_multiply_extendable",
        "operator_power"
      ]
    });
  }
};
Blockly.Blocks['operator_power'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "extendable",
          "name": "NUMS",
          "args": [
            {
              "type": "input_value",
              "name": "NUM",
              "shadowOpcode": "math_number",
              "shadowFieldName": "NUM",
              "shadowFieldValue": ""
            },
          ],
          "separator": "^",
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"],
      "switches": [
        "operator_add_extendable",
        "operator_subtract_extendable",
        "operator_multiply_extendable",
        "operator_divide_extendable"
      ]
    });
  }
};

Blockly.Blocks['operator_and_extendable'] = {
  /**
   * Block for extendable "and" boolean comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_AND_EXTENDABLE,
      "args0": [
        {
          "type": "extendable",
          "name": "OPERANDS",
          "args": [
            {
              "type": "input_value",
              "name": "OPERAND",
              "check": "Boolean"
            },
          ],
          "separator": Blockly.Msg.OPERATORS_AND_EXTENDABLE_SEPARATOR,
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": ["operator_or_extendable","operator_xor_extendable"]
    });
  }
};
Blockly.Blocks['operator_or_extendable'] = {
  /**
   * Block for extendable "or" boolean comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_OR_EXTENDABLE,
      "args0": [
        {
          "type": "extendable",
          "name": "OPERANDS",
          "args": [
            {
              "type": "input_value",
              "name": "OPERAND",
              "check": "Boolean"
            },
          ],
          "separator": Blockly.Msg.OPERATORS_OR_EXTENDABLE_SEPARATOR,
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": ["operator_and_extendable","operator_xor_extendable"]
    });
  }
};
Blockly.Blocks['operator_xor_extendable'] = {
  /**
   * Block for extendable "xor" boolean comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_XOR_EXTENDABLE,
      "args0": [
        {
          "type": "extendable",
          "name": "OPERANDS",
          "args": [
            {
              "type": "input_value",
              "name": "OPERAND",
              "check": "Boolean"
            },
          ],
          "separator": Blockly.Msg.OPERATORS_XOR_EXTENDABLE_SEPARATOR,
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": ["operator_and_extendable","operator_or_extendable"]
    });
  }
};

Blockly.Blocks['operator_lt_extendable'] = {
  /**
   * Block for extendable less-than comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LT_EXTENDABLE,
      "args0": [
        {
          "type": "extendable",
          "name": "OPERANDS",
          "args": [
            {
              "type": "input_value",
              "name": "OPERAND",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": ""
            },
          ],
          "separator": Blockly.Msg.OPERATORS_LT_EXTENDABLE_SEPARATOR,
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": [
        "operator_gt_extendable",
        "operator_gte",
        "operator_equals_extendable",
        "operator_lte"
      ]
    });
  }
};

Blockly.Blocks['operator_equals_extendable'] = {
  /**
   * Block for extendable equals comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_EQUALS_EXTENDABLE,
      "args0": [
        {
          "type": "extendable",
          "name": "OPERANDS",
          "args": [
            {
              "type": "input_value",
              "name": "OPERAND",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": ""
            },
          ],
          "separator": Blockly.Msg.OPERATORS_EQUALS_EXTENDABLE_SEPARATOR,
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": [
        "operator_gt_extendable",
        "operator_gte",
        "operator_lt_extendable",
        "operator_lte"
      ]
    });
  }
};

Blockly.Blocks['operator_gt_extendable'] = {
  /**
   * Block for extendable greater-than comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_GT_EXTENDABLE,
      "args0": [
        {
          "type": "extendable",
          "name": "OPERANDS",
          "args": [
            {
              "type": "input_value",
              "name": "OPERAND",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": ""
            },
          ],
          "separator": Blockly.Msg.OPERATORS_GT_EXTENDABLE_SEPARATOR,
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": [
        "operator_gte",
        "operator_equals_extendable",
        "operator_lt_extendable",
        "operator_lte"
      ]
    });
  }
};

Blockly.Blocks['operator_lte'] = {
  /**
   * Block for less-than-or-equal comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LTE,
      "args0": [
        {
          "type": "extendable",
          "name": "OPERANDS",
          "args": [
            {
              "type": "input_value",
              "name": "OPERAND",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": ""
            },
          ],
          "separator": Blockly.Msg.OPERATORS_LTE_SEPARATOR,
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": [
        "operator_gt_extendable",
        "operator_gte",
        "operator_equals_extendable",
        "operator_lt_extendable"
      ]
    });
  }
};

Blockly.Blocks['operator_gte'] = {
  /**
   * Block for greater-than-or-equal comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_GTE,
      "args0": [
        {
          "type": "extendable",
          "name": "OPERANDS",
          "args": [
            {
              "type": "input_value",
              "name": "OPERAND",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": ""
            },
          ],
          "separator": Blockly.Msg.OPERATORS_GTE_SEPARATOR,
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"],
      "switches": [
        "operator_gt_extendable",
        "operator_equals_extendable",
        "operator_lt_extendable",
        "operator_lte"
      ]
    });
  }
};
