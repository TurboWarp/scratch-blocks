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
 * @fileoverview Handling of local and global procedures.
 * @author Cubester@NitroBolt
 */
'use strict';

/**
 * @name Blockly.ProceduresMap
 * @namespace
 **/
goog.provide('Blockly.ProceduresMap');

goog.require('Blockly.Xml');

/**
 * Map of globally scoped procedure mutations, keyed by proccode.
 * @param {!Blockly.Workspace} workspace Owning workspace.
 * @constructor
 */
Blockly.ProceduresMap = function(workspace) {
  this.procedureMap_ = Object.create(null);
  this.workspace = workspace;
};

/**
 * Clear all tracked procedure mutations.
 */
Blockly.ProceduresMap.prototype.clear = function() {
  this.procedureMap_ = Object.create(null);
};

/**
 * Add or replace a tracked procedure mutation.
 * @param {!Element} mutation Procedure mutation XML.
 */
Blockly.ProceduresMap.prototype.createProcedureMutation = function(mutation) {
  if (!mutation) {
    return;
  }
  var proccode = mutation.getAttribute('proccode');
  if (!proccode) {
    return;
  }
  this.procedureMap_[proccode] = mutation;
};

/**
 * Get all tracked procedure mutations.
 * @return {!Array<!Element>} Procedure mutation XML elements.
 */
Blockly.ProceduresMap.prototype.getAllProcedureMutations = function() {
  return Object.values(this.procedureMap_);
};

/**
 * Get a tracked procedure mutation by proccode.
 * @param {string} proccode Procedure identifier.
 * @return {?Element} Procedure mutation XML if found.
 */
Blockly.ProceduresMap.prototype.getProcedureMutationByProccode = function(proccode) {
  return this.procedureMap_[proccode] || null;
};

/**
 * Refresh the map from VM runtime global procedure mutation data.
 */
Blockly.ProceduresMap.prototype.refreshFromVM = function() {
  var vm = this.workspace && this.workspace.vm;
  var runtime = vm && vm.runtime;
  if (!runtime || !runtime.getGlobalProcedureMutationData) {
    this.clear();
    return;
  }

  var editingTargetId = vm.editingTarget && vm.editingTarget.id;
  var mutationData = runtime.getGlobalProcedureMutationData(editingTargetId);

  this.clear();
  for (var i = 0; i < mutationData.length; i++) {
    this.createProcedureMutation(
        Blockly.ProceduresMap.mutationDataToDom_(mutationData[i])
    );
  }
};

/**
 * Convert plain VM mutation data into a mutation XML element.
 * @param {!Object} data Mutation data.
 * @return {!Element} Mutation XML element.
 * @private
 */
Blockly.ProceduresMap.mutationDataToDom_ = function(data) {
  var mutation = Blockly.Xml.textToDom('<xml><mutation/></xml>').firstChild;
  var keys = Object.keys(data || {});
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = data[key];
    if (typeof value === 'undefined' || value === null) {
      continue;
    }
    mutation.setAttribute(key, String(value));
  }
  if (!mutation.hasAttribute('generateshadows')) {
    mutation.setAttribute('generateshadows', 'true');
  }
  return mutation;
};
