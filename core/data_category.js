/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Data Flyout components including variable and list blocks.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

/**
 * @name Blockly.DataCategory
 * @namespace
 **/
goog.provide('Blockly.DataCategory');

goog.require('Blockly.Blocks');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Variables');
goog.require('Blockly.Workspace');

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace containing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.DataCategory = function(workspace) {
  var variableModelList = workspace.getVariablesOfType('');
  variableModelList.sort(Blockly.VariableModel.compareByName);
  var xmlList = [];

  Blockly.DataCategory.addCreateButton(xmlList, workspace, 'VARIABLE');

  for (var i = 0; i < variableModelList.length; i++) {
    Blockly.DataCategory.addDataVariable(xmlList, variableModelList[i]);
  }

  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', 28);
    var firstVariable = variableModelList[0];

    Blockly.DataCategory.addSetVariableTo(xmlList, firstVariable);
    Blockly.DataCategory.addChangeVariableBy(xmlList, firstVariable);
    Blockly.DataCategory.addShowVariable(xmlList, firstVariable);
    Blockly.DataCategory.addHideVariable(xmlList, firstVariable);
  }

  // Now add list variables to the flyout
  Blockly.DataCategory.addCreateButton(xmlList, workspace, 'LIST');
  variableModelList = workspace.getVariablesOfType(Blockly.LIST_VARIABLE_TYPE);
  variableModelList.sort(Blockly.VariableModel.compareByName);
  for (var i = 0; i < variableModelList.length; i++) {
    Blockly.DataCategory.addDataList(xmlList, variableModelList[i]);
  }

  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', 28);
    var firstVariable = variableModelList[0];

    Blockly.DataCategory.addAddToList(xmlList, firstVariable);
    Blockly.DataCategory.addSep(xmlList);
    Blockly.DataCategory.addDeleteOfList(xmlList, firstVariable);
    // Blockly.DataCategory.addDeleteAllOfList(xmlList, firstVariable);
    Blockly.DataCategory.addInsertAtList(xmlList, firstVariable);
    Blockly.DataCategory.addReplaceItemOfList(xmlList, firstVariable);
    Blockly.DataCategory.addSep(xmlList);
    Blockly.DataCategory.addItemOfList(xmlList, firstVariable);
    Blockly.DataCategory.addItemNumberOfList(xmlList, firstVariable);
    Blockly.DataCategory.addLengthOfList(xmlList, firstVariable);
    Blockly.DataCategory.addListContainsItem(xmlList, firstVariable);
    Blockly.DataCategory.addSep(xmlList);
    Blockly.DataCategory.addListAsArray(xmlList, firstVariable);
    Blockly.DataCategory.addSetListArray(xmlList, firstVariable);
    Blockly.DataCategory.addSep(xmlList);
    Blockly.DataCategory.addShowList(xmlList, firstVariable);
    Blockly.DataCategory.addHideList(xmlList, firstVariable);
  }

  // Now add table variables to the flyout
  Blockly.DataCategory.addCreateButton(xmlList, workspace, 'TABLE');
  variableModelList = workspace.getVariablesOfType(Blockly.TABLE_VARIABLE_TYPE);
  variableModelList.sort(Blockly.VariableModel.compareByName);
  for (var i = 0; i < variableModelList.length; i++) {
    Blockly.DataCategory.addDataTable(xmlList, variableModelList[i]);
  }

  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', 28);
    var firstVariable = variableModelList[0];

    Blockly.DataCategory.addAddToTable(xmlList, firstVariable);
    Blockly.DataCategory.addInsertDimensionToTable(xmlList, firstVariable);
    Blockly.DataCategory.addSetCellInTable(xmlList, firstVariable);
    Blockly.DataCategory.addDeleteCellInTable(xmlList, firstVariable);
    Blockly.DataCategory.addDeleteDimensionInTable(xmlList, firstVariable);
    Blockly.DataCategory.addDeleteAllOfTable(xmlList, firstVariable);
    Blockly.DataCategory.addSep(xmlList);
    Blockly.DataCategory.addItemInCellOfTable(xmlList, firstVariable);
    Blockly.DataCategory.addItemsOfDimensionOfTable(xmlList, firstVariable);
    Blockly.DataCategory.addLengthOfDimensionOfTable(xmlList, firstVariable);
    Blockly.DataCategory.addDimensionCountOfTable(xmlList, firstVariable);
    Blockly.DataCategory.addTableContainsItemInCell(xmlList, firstVariable);
    Blockly.DataCategory.addSep(xmlList);
    Blockly.DataCategory.addTableAsArray(xmlList, firstVariable);
    Blockly.DataCategory.addSetTableUsingArray(xmlList, firstVariable);
    Blockly.DataCategory.addSep(xmlList);
    Blockly.DataCategory.addShowTable(xmlList, firstVariable);
    Blockly.DataCategory.addHideTable(xmlList, firstVariable);
  }

  return xmlList;
};

/**
 * Construct and add a data_variable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addDataVariable = function(xmlList, variable) {
  // <block id="variableId" type="data_variable">
  //    <field name="VARIABLE">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_variable', 'VARIABLE');
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId());
};

/**
 * Construct and add a data_setvariableto block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addSetVariableTo = function(xmlList, variable) {
  // <block type="data_setvariableto" gap="20">
  //   <value name="VARIABLE">
  //    <shadow type="data_variablemenu"></shadow>
  //   </value>
  //   <value name="VALUE">
  //     <shadow type="text">
  //       <field name="TEXT">0</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_setvariableto',
      'VARIABLE', [['VALUE', 'text', 0]]);
};

/**
 * Construct and add a data_changevariableby block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addChangeVariableBy = function(xmlList, variable) {
  // <block type="data_changevariableby">
  //   <value name="VARIABLE">
  //    <shadow type="data_variablemenu"></shadow>
  //   </value>
  //   <value name="VALUE">
  //     <shadow type="math_number">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_changevariableby',
      'VARIABLE', [['VALUE', 'math_number', 1]]);
};

/**
 * Construct and add a data_showVariable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addShowVariable = function(xmlList, variable) {
  // <block type="data_showvariable">
  //   <value name="VARIABLE">
  //     <shadow type="data_variablemenu"></shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_showvariable',
      'VARIABLE');
};

/**
 * Construct and add a data_hideVariable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addHideVariable = function(xmlList, variable) {
  // <block type="data_hidevariable">
  //   <value name="VARIABLE">
  //     <shadow type="data_variablemenu"></shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_hidevariable',
      'VARIABLE');
};

/**
 * Construct and add a data_listcontents block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addDataList = function(xmlList, variable) {
  // <block id="variableId" type="data_listcontents">
  //    <field name="LIST">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_listcontents', 'LIST');
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId());
};

/**
 * Construct and add a data_addtolist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addAddToList = function(xmlList, variable) {
  // <block type="data_addtolist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_addtolist', 'LIST',
      [['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM]]);
};

/**
 * Construct and add a data_deleteoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addDeleteOfList = function(xmlList, variable) {
  // <block type="data_deleteoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="data_listindex">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_deleteoflist', 'LIST',
      [['INDEX', 'data_listindex', 1]]);
};

/**
 * Construct and add a data_deleteoflist block to xmlList.
 * Removed from NitroBolt
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
/*
Blockly.DataCategory.addDeleteAllOfList = function(xmlList, variable) {
  // <block type="data_deletealloflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_deletealloflist',
      'LIST');
};
*/

/**
 * Construct and add a data_insertatlist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addInsertAtList = function(xmlList, variable) {
  // <block type="data_insertatlist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="data_listindexrandom">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_insertatlist', 'LIST',
      [['INDEX', 'data_listindexrandom', 1], ['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM]]);
};

/**
 * Construct and add a data_replaceitemoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addReplaceItemOfList = function(xmlList, variable) {
  // <block type="data_replaceitemoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="data_listindexrandom">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_replaceitemoflist',
      'LIST', [['INDEX', 'data_listindexrandom', 1], ['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM]]);
};

/**
 * Construct and add a data_itemoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addItemOfList = function(xmlList, variable) {
  // <block type="data_itemoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="data_listindexrandom">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_itemoflist', 'LIST',
      [['INDEX', 'data_listindexrandom', 1]]);
};

/** Construct and add a data_itemnumoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addItemNumberOfList = function(xmlList, variable) {
  // <block type="data_itemnumoflist">
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_itemnumoflist',
      'LIST', [['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM]]);
};

/**
 * Construct and add a data_lengthoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addLengthOfList = function(xmlList, variable) {
  // <block type="data_lengthoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_lengthoflist', 'LIST');
};

/**
 * Construct and add a data_listcontainsitem block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addListContainsItem = function(xmlList, variable) {
  // <block type="data_listcontainsitem">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_listcontainsitem',
      'LIST', [['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM]]);
};

/**
 * Construct and add a data_lengthoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addListAsArray = function(xmlList, variable) {
  // <block type="data_listasarray">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_listasarray', 'LIST');
};

/**
 * Construct and add a data_lengthoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addSetListArray = function(xmlList, variable) {
  // <block type="data_setlistarray">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_setlistarray', 'LIST');
};

/**
 * Construct and add a data_showlist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addShowList = function(xmlList, variable) {
  // <block type="data_showlist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_showlist', 'LIST');
};

/**
 * Construct and add a data_hidelist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addHideList = function(xmlList, variable) {
  // <block type="data_hidelist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_hidelist', 'LIST');
};

/**
 * Construct and add a data_tablecontents block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addDataTable = function(xmlList, variable) {
  // <block id="variableId" type="data_tablecontents">
  //    <field name="TABLE">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_tablecontents', 'TABLE');
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId());
};

/**
 * Construct and add a data_addtotable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addAddToTable = function(xmlList, variable) {
  // <block type="data_addtotable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_addtotable', 'TABLE');
};

/**
 * Construct and add a data_insertdimensiontotable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addInsertDimensionToTable = function(xmlList, variable) {
  // <block type="data_insertdimensiontotable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_insertdimensiontotable', 'TABLE',
      [['INDEX', 'math_integer', 1]]);
};

/**
 * Construct and add a data_setcellintable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addSetCellInTable = function(xmlList, variable) {
  // <block type="data_setcellintable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  //   <value name="COLUMN">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ROW">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_setcellintable', 'TABLE',
      [['COLUMN', 'math_integer', 1], ['ROW', 'math_integer', 1], ['ITEM', 'text', Blockly.Msg.DEFAULT_TABLE_ITEM]]);
};

/**
 * Construct and add a data_deletecellintable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addDeleteCellInTable = function(xmlList, variable) {
  // <block type="data_deletecellintable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  //   <value name="COLUMN">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ROW">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_deletecellintable', 'TABLE',
      [['COLUMN', 'math_integer', 1], ['ROW', 'math_integer', 1]]);
};

/**
 * Construct and add a data_deletedimensionintable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addDeleteDimensionInTable = function(xmlList, variable) {
  // <block type="data_deletedimensionintable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="data_listindexrandom">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_deletedimensionintable', 'TABLE',
      [['INDEX', 'data_listindexrandom', 1]]);
};

/**
 * Construct and add a data_deleteoftable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addDeleteAllOfTable = function(xmlList, variable) {
  // <block type="data_deletealloftable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_deletealloftable',
      'TABLE');
};

/**
 * Construct and add a data_itemincelloftable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addItemInCellOfTable = function(xmlList, variable) {
  // <block type="data_itemincelloftable">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="COLUMN">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ROW">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_itemincelloftable', 'TABLE',
      [['COLUMN', 'math_integer', 1], ['ROW', 'math_integer', 1]]);
};

/**
 * Construct and add a data_itemsofdimensionoftable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addItemsOfDimensionOfTable = function(xmlList, variable) {
  // <block type="data_itemsofdimensionoftable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="data_listindexrandom">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_itemsofdimensionoftable', 'TABLE',
      [['INDEX', 'data_listindexrandom', 1]]);
};

/**
 * Construct and add a data_lengthofdimensionoftable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addLengthOfDimensionOfTable = function(xmlList, variable) {
  // <block type="data_lengthofdimensionoftable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="data_listindexrandom">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_lengthofdimensionoftable', 'TABLE',
      [['INDEX', 'data_listindexrandom', 1]]);
};

/**
 * Construct and add a data_dimensioncountoftable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addDimensionCountOfTable = function(xmlList, variable) {
  // <block type="data_dimensioncountoftable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_dimensioncountoftable', 'TABLE');
};

/**
 * Construct and add a data_tablecontainsitemincell block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addTableContainsItemInCell = function(xmlList, variable) {
  // <block type="data_tablecontainsitemincell">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  //   <value name="COLUMN">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ROW">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_tablecontainsitemincell', 'TABLE',
      [['ITEM', 'text', Blockly.Msg.DEFAULT_TABLE_ITEM], ['COLUMN', 'math_integer', 1], ['ROW', 'math_integer', 1]]);
};

/**
 * Construct and add a data_tableasarray block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addTableAsArray = function(xmlList, variable) {
  // <block type="data_tableasarray">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_tableasarray', 'TABLE');
};

/**
 * Construct and add a data_settableusingarray block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addSetTableUsingArray = function(xmlList, variable) {
  // <block type="data_settableusingarray">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_settableusingarray', 'TABLE');
};

/**
 * Construct and add a data_showtable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addShowTable = function(xmlList, variable) {
  // <block type="data_showtable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_showtable', 'TABLE');
};

/**
 * Construct and add a data_hidetable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
Blockly.DataCategory.addHideTable = function(xmlList, variable) {
  // <block type="data_hidetable">
  //   <field name="TABLE" variabletype="table" id="">variablename</field>
  // </block>
  Blockly.DataCategory.addBlock(xmlList, variable, 'data_hidetable', 'TABLE');
};

/**
 * Construct a create variable button and push it to the xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {Blockly.Workspace} workspace Workspace to register callback to.
 * @param {string} type Type of variable this is for. For example, 'LIST' or
 *     'VARIABLE'.
 */
Blockly.DataCategory.addCreateButton = function(xmlList, workspace, type) {
  var button = goog.dom.createDom('button');
  // Set default msg, callbackKey, and callback values for type 'VARIABLE'
  var msg = Blockly.Msg.NEW_VARIABLE;
  var callbackKey = 'CREATE_VARIABLE';
  var callback = function(button) {
    Blockly.Variables.createVariable(button.getTargetWorkspace(), null, '');};

  if (type === 'LIST') {
    msg = Blockly.Msg.NEW_LIST;
    callbackKey = 'CREATE_LIST';
    callback = function(button) {
      Blockly.Variables.createVariable(button.getTargetWorkspace(), null,
          Blockly.LIST_VARIABLE_TYPE);};
  } else if (type === 'TABLE') {
    msg = Blockly.Msg.NEW_TABLE;
    callbackKey = 'CREATE_TABLE';
    callback = function(button) {
      Blockly.Variables.createVariable(button.getTargetWorkspace(), null,
          Blockly.TABLE_VARIABLE_TYPE);};
  }
  button.setAttribute('text', msg);
  button.setAttribute('callbackKey', callbackKey);
  workspace.registerButtonCallback(callbackKey, callback);
  xmlList.push(button);
};

/**
 * Construct a variable block with the given variable, blockType, and optional
 *     value tags. Add the variable block to the given xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 * @param {string} blockType Type of block. For example, 'data_hidelist' or
 *     data_showlist'.
 * @param {string} fieldName Name of field in block. For example: 'VARIABLE',
 *     'LIST', or 'TABLE'.
 * @param {?Array.<string>} opt_value Optional array containing an array of arrays that
 *     each contain the definition of each input.
 */
Blockly.DataCategory.addBlock = function(xmlList, variable, blockType, fieldName, opt_value) {
  if (Blockly.Blocks[blockType]) {
    var valueFields;
    if (opt_value) {
      opt_value.forEach((input) => {
        valueFields += Blockly.DataCategory.createValue(input[0], input[1], input[2]);
      });
    }

    var gap = 10;
    var blockText = '<xml>' +
        '<block type="' + blockType + '" gap="' + gap + '">' +
        Blockly.Variables.generateVariableFieldXml_(variable, fieldName) +
        valueFields +
        '</block>' +
        '</xml>';
    var block = Blockly.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);
  }
};

/**
 * Create the text representation of a value dom element with a shadow of the
 *     indicated type inside.
 * @param {string} valueName Name of the value tags.
 * @param {string} type The type of the shadow tags.
 * @param {string|number} value The default shadow value.
 * @return {string} The generated dom element in text.
 */
Blockly.DataCategory.createValue = function(valueName, type, value) {
  var fieldName;
  switch (valueName) { // Figure out a better, more dynamic method.
    case 'ITEM':
      fieldName = 'TEXT';
      break;
    case 'INDEX':
      fieldName = 'NUM';
      break;
    case 'VALUE':
      if (type === 'math_number') {
        fieldName = 'NUM';
      } else {
        fieldName = 'TEXT';
      }
      break;
    case 'COLUMN':
      fieldName = 'NUM';
      break;
    case 'ROW':
      fieldName = 'NUM';
      break;
  }
  var valueField =
      '<value name="' + valueName + '">' +
      '<shadow type="' + type + '">' +
      '<field name="' + fieldName + '">' + value + '</field>' +
      '</shadow>' +
      '</value>';
  return valueField;
};

/**
 * Construct a block separator. Add the separator to the given xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 */
Blockly.DataCategory.addSep = function(xmlList) {
  var gap = 36;
  var sepText = '<xml>' +
      '<sep gap="' + gap + '"/>' +
      '</xml>';
  var sep = Blockly.Xml.textToDom(sepText).firstChild;
  xmlList.push(sep);
};
