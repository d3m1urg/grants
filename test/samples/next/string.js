'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Checks whether provided value matches specified regular expression.
 * @param  {String} value A value to check
 * @param  {String} regex Regular expression to match against
 * @return {Boolean}      true is match found, false otherwise
 */
var match = function match(value, regex) {
  return value.match(regex) !== null;
};

/**
 * Checks if string length is greater or equal to minimum value.
 * @param  {String} value The string to check
 * @param  {Number} min   Minimum allowed string length
 * @return {Boolean}
 */
var minLen = function minLen(value, min) {
  return value.length >= min;
};

/**
 * Checks if string length is less or equal to maximum value.
 * @param  {String} value The string to check
 * @param  {Number} max   Maximum allowed string length
 * @return {Boolean}
 */
var maxLen = function maxLen(value, max) {
  return value.length <= max;
};

var rules = exports.rules = [{
  name: 'match',
  label: 'common.rules.string.match.label',
  description: 'common.rules.string.match.description',
  args: [{
    type: 'string',
    required: true,
    label: 'common.rules.string.match.argsLabels.0'
  }, {
    type: 'string',
    required: true,
    label: 'common.rules.string.match.argsLabels.1'
  }],
  fn: match,
  errorText: 'common.rules.string.match.errorText'
}, {
  name: 'minLen',
  label: 'common.rules.string.minLen.label',
  description: 'common.rules.string.minLen.description',
  args: [{
    type: 'string',
    required: true,
    label: 'common.rules.string.minLen.argsLabels.0'
  }, {
    type: 'number',
    required: true,
    label: 'common.rules.string.minLen.argsLabels.1'
  }],
  fn: minLen,
  errorText: 'common.rules.string.minLen.errorText'
}, {
  name: 'maxLen',
  label: 'common.rules.string.maxLen.label',
  description: 'common.rules.string.maxLen.description',
  args: [{
    type: 'string',
    required: true,
    label: 'common.rules.string.maxLen.argsLabels.0'
  }, {
    type: 'number',
    required: true,
    label: 'common.rules.string.maxLen.argsLabels.1'
  }],
  fn: maxLen,
  errorText: 'common.rules.string.maxLen.errorText'
}];

/**
 * Module name used for dynamic loading.
 * @type {String}
 */
var _module = 'string';
exports.module = _module;
