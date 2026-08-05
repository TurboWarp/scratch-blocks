/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2025 NitroBolt.
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
 * @fileoverview Fix up some polyfill's and stuff :)
 * @author Miyo Sho
 */
'use strict';

/* eslint-disable no-undef */

goog.provide('Polypatch');
goog.require('goog.color');
goog.require('goog.array');
goog.require('goog.asserts');
goog.provide('goog.isSafeFunction');
goog.provide('goog.asserts.assertAtLeastLength');
goog.provide('goog.queueMicrotask');

/**
 * Checks if a value is a safe callable function.
 * @returns {boolean}
 */
goog.isSafeFunction = function(value) {
  return (goog.typeOf(value) == 'function') && goog.isDef(value.call);
};

// Allow transparent hex code's
goog.color.validHexColorRe_ = /^#((?:[0-9a-f]{3}){1,2}$)|(?:[0-9a-f]{8}$)/i;

// Attempt to find native implementation's and replace goog's implementations of them.
if (goog.isSafeFunction(Array.isArray.call)) goog.isArray = Array.isArray;
if (goog.isSafeFunction(Array.from)) goog.array.toArray = Array.from;

/**
 * Checks if the value is at least N length.
 * @param {*} value The value to check.
 * @param {number} length The minimum length to check for.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!ArrayLike} The value, guaranteed to be a non-null array-like value.
 * @throws {goog.asserts.AssertionError}
   When the value is not an array, length is not a number
   or the array length is not the same as length.
 */
goog.asserts.assertAtLeastLength = function(value, length, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    if (!goog.isArrayLike(value)) {
      goog.asserts.doAssertFailure_(
        'Expected array-like but got %s: %s.', [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2)
      );
    }
    if (!goog.isNumber(length)) {
      goog.asserts.doAssertFailure_(
        'Expected number but got %s: %s.', [goog.typeOf(length), length],
        opt_message, Array.prototype.slice.call(arguments, 2)
      );
    }
  }
  if (value.length >= length) return /** @type {!Array<?>} */ (value);
  goog.asserts.doAssertFailure_(
    'Expected array-like to be minimum length of %s but got: %s.', [length, value.length],
    opt_message, Array.prototype.slice.call(arguments, 2)
  );
};

// Polyfill queueMicrotask
if (goog.isSafeFunction(goog.global.queueMicrotask)) {
  goog.queueMicrotask = goog.global.queueMicrotask.bind(goog.global);
} else {
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#microtask-queuing
  goog.queueMicrotask = function(task) {
    goog.asserts.assertAtLeastLength(arguments, 1, 'Window.queueMicrotask: At least 1 argument required, but only 0 passed', arguments.length);
    goog.asserts.assertObject(task, 'Window.queueMicrotask: Argument 1 is not an object.');
    goog.asserts.assertFunction(task, 'Window.queueMicrotask: Argument 1 is not callable.');
    goog.queueMicrotask.now(task);
  };
  // More modern browsers
  if (goog.isDef(goog.global.Promise)) {
    goog.queueMicrotask.now = task => goog.global.Promise.resolve().then(task).catch(error => {
      setTimeout(() => { throw error; }, 0);
    });
  } else if (goog.isDef(goog.global.MutationObserver)) {
    goog.queueMicrotask.now = (task) => {
      // MutationObserver's also queueMicrotask's and are supported in older browsers.
      var queue = new MutationObserver(function() {
        task();
        queue.disconnect();
      });
      var target = document.createElement('');
      queue.observe(target, { attributes: true });
      target.setAttribute('data-mutation', '');
    };
  } else {
    console.warn('Unable to find queueMicrotask fallback, using slower alternative.');
    goog.queueMicrotask.now = function(task) {
      setTimeout(task, 0);
    };
  }
  goog.global.queueMicrotask = goog.queueMicrotask;
}
