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

'use strict';

goog.provide('Blockly.Blocks.json');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['json_new_object'] = {
  /**
   * Returns a new Object
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_NEW_OBJECT,
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"]
    });
  }
};

Blockly.Blocks['json_object'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_OBJECT,
      "args0": [
        {
          "type": "extendable",
          "name": "ITEMS",
          "args": [
            {
              "type": "input_value",
              "name": "KEY",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": ""
            },
            {
              "type": "field_label",
              "text": ":"
            },
            {
              "type": "input_value",
              "name": "VALUE",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": ""
            },
          ],
          "separator": ",",
          "minInputs": 0
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"]
    });
  }
};

Blockly.Blocks['json_get_properties'] = {
  /**
   * Fetches keys, values, or entries of an object based on selection.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_GET_PROPERTIES,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PROPERTY",
          "options": [
            [Blockly.Msg.JSON_GET_PROPERTIES_KEYS, "keys"],
            [Blockly.Msg.JSON_GET_PROPERTIES_VALUES, "values"],
            [Blockly.Msg.JSON_GET_PROPERTIES_ENTRIES, "entries"]
          ]
        },
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_value_of_key'] = {
  /**
   * Fetches the value of the target key
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_VALUE_OF_KEY,
      "args0": [
        {
          "type": "input_value",
          "name": "KEY"
        },
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        }
      ],
      "output": null,
      "category": Blockly.Categories.json,
      "extensions": ["colours_json"],
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "switches": [
        'json_set_key',
        'json_delete_key'
      ]
    });
  }
};

Blockly.Blocks['json_set_key'] = {
  /**
   * Sets the value of the target key
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_SET_KEY,
      "args0": [
        {
          "type": "input_value",
          "name": "KEY",
          "shadowOpcode": "text",
          "shadowFieldName": "TEXT",
          "shadowFieldValue": ""
        },
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "shadowOpcode": "text",
          "shadowFieldName": "TEXT",
          "shadowFieldValue": ""
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"],
      "switches": [
        { id: 'json_value_of_key', splitInputs: ['VALUE'] },
        { id: 'json_delete_key', splitInputs: ['VALUE'] }
      ]
    });
  }
};

Blockly.Blocks['json_delete_key'] = {
  /**
   * Deletes the target key
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_DELETE_KEY,
      "args0": [
        {
          "type": "input_value",
          "name": "KEY"
        },
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"],
      "switches": [
        'json_value_of_key',
        'json_set_key'
      ]
    });
  }
};

Blockly.Blocks['json_merge_object'] = {
  /**
   * Merge objects
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_MERGE,
      "args0": [
        {
          "type": "extendable",
          "name": "ITEMS",
          "args": [
            {
              "type": "input_value",
              "name": "ITEM",
              "check": "Object"
            },
          ],
          "separator": "",
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"]
    });
  }
};

Blockly.Blocks['json_has_key'] = {
  /**
   * Checks if object has target key
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_HAS_KEY,
      "args0": [
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        },
        {
          "type": "input_value",
          "name": "KEY"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_boolean"]
    });
  }
};

Blockly.Blocks['json_new_array'] = {
  /**
   * Returns a new Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_NEW_ARRAY,
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_array'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_ARRAY,
      "args0": [
        {
          "type": "extendable",
          "name": "ITEMS",
          "args": [
            {
              "type": "input_value",
              "name": "ITEM",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": ""
            },
          ],
          "separator": "",
          "minInputs": 0
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_indexmenu'] = {
  /**
   * JSON index menu
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_numberdropdown",
          "name": "INDEX",
          "value": "0",
          "min": 0,
          "precision": 1,
          "options": [
            ["0", "0"],
            [Blockly.Msg.DATA_INDEX_LAST, "last"],
            [Blockly.Msg.DATA_INDEX_RANDOM, "random"]
          ]
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_textfield", "output_string"]
    });
  }
};

Blockly.Blocks['json_value_of_index'] = {
  /**
   * Fetches the value of the given index
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_VALUE_OF_INDEX,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "output": null,
      "category": Blockly.Categories.json,
      "extensions": ["colours_json"],
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "switches": [
        'json_replace_index',
        'json_delete_index'
      ]
    });
  }
};

Blockly.Blocks['json_index_of_value'] = {
  /**
   * Fetches the index of the given value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_INDEX_OF_VALUE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_number"]
    });
  }
};

Blockly.Blocks['json_add_item'] = {
  /**
   * Adds a new item to the Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_ADD_ITEM,
      "args0": [
        {
          "type": "extendable",
          "name": "ITEMS",
          "args": [
            {
              "type": "input_value",
              "name": "ITEM",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": Blockly.Msg.JSON_BAR
            },
          ],
          "separator": "",
          "minInputs": 1
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_replace_index'] = {
  /**
   * Replaces an item indexed with another item in an Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_REPLACE_INDEX,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        },
        {
          "type": "input_value",
          "name": "ITEM"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"],
      "switches": [
        { id: 'json_value_of_index', splitInputs: ['ITEM'] },
        { id: 'json_delete_index', splitInputs: ['ITEM'] }
      ]
    });
  }
};

Blockly.Blocks['json_delete_index'] = {
  /**
   * Deletes the value of the given index
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_DELETE_INDEX,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"],
      "switches": [
        'json_value_of_index',
        'json_replace_index'
      ]
    });
  }
};

Blockly.Blocks['json_delete_all_occurrences'] = {
  /**
   * Deletes all occurrences of a item from the Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_DELETE_ALL_OCCURRENCES,
      "args0": [
        {
          "type": "input_value",
          "name": "ITEM"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_merge_array'] = {
  /**
   * Merge arrays
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_MERGE,
      "args0": [
        {
          "type": "extendable",
          "name": "ITEMS",
          "args": [
            {
              "type": "input_value",
              "name": "ITEM",
              "check": "Array"
            },
          ],
          "separator": "",
          "minInputs": 2
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_has_item'] = {
  /**
   * Checks if Array has target item
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_HAS_ITEM,
      "args0": [
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        },
        {
          "type": "input_value",
          "name": "ITEM"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_boolean"]
    });
  }
};

Blockly.Blocks['json_array_length'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_ARRAY_LENGTH,
      "args0": [
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_number"]
    });
  }
};

Blockly.Blocks['json_slice_array'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_SLICE_ARRAY,
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
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_reverse_array'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_REVERSE_ARRAY,
      "args0": [
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_foreach'] = {
  /**
   * Block for each item and index in array.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_FOREACH,
      "message1": "%1", // Statement
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        },
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "ARRAY",
          "check": "Array"
        },
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "shape_statement"],
    });
  }
};

Blockly.Blocks['json_foreach_value'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_FOREACH_VALUE,
      "output": null,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "category": Blockly.Categories.json,
      "duplicateOnDrag": true,
      "extensions": ["colours_json"],
    });
  }
};

Blockly.Blocks['json_foreach_index'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_FOREACH_INDEX,
      "category": Blockly.Categories.json,
      "duplicateOnDrag": true,
      "extensions": ["colours_json", "output_number"]
    });
  }
};
