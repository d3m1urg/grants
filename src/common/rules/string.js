/**
 * Checks whether provided value matches specified regular expression.
 * @param  {String} value A value to check
 * @param  {String} regex Regular expression to match against
 * @return {Boolean}      true is match found, false otherwise
 */
const match = (value, regex) => (value.match(regex) !== null);

/**
 * Checks if string length is greater or equal to minimum value.
 * @param  {String} value The string to check
 * @param  {Number} min   Minimum allowed string length
 * @return {Boolean}
 */
const minLen = (value, min) => (value.length >= min);

/**
 * Checks if string length is less or equal to maximum value.
 * @param  {String} value The string to check
 * @param  {Number} max   Maximum allowed string length
 * @return {Boolean}
 */
const maxLen = (value, max) => (value.length <= max);

export const rules = [
  {
    name: 'match',
    label: 'common.rules.string.match.label',
    description: 'common.rules.string.match.description',
    args: [
      {
        type: 'string',
        required: true,
        label: 'common.rules.string.match.argsLabels.0',
      },
      {
        type: 'string',
        required: true,
        label: 'common.rules.string.match.argsLabels.1',
      },
    ],
    fn: match,
    errorText: 'common.rules.string.match.errorText',
  },
  {
    name: 'minLen',
    label: 'common.rules.string.minLen.label',
    description: 'common.rules.string.minLen.description',
    args: [
      {
        type: 'string',
        required: true,
        label: 'common.rules.string.minLen.argsLabels.0',
      },
      {
        type: 'number',
        required: true,
        label: 'common.rules.string.minLen.argsLabels.1',
      },
    ],
    fn: minLen,
    errorText: 'common.rules.string.minLen.errorText',
  },
  {
    name: 'maxLen',
    label: 'common.rules.string.maxLen.label',
    description: 'common.rules.string.maxLen.description',
    args: [
      {
        type: 'string',
        required: true,
        label: 'common.rules.string.maxLen.argsLabels.0',
      },
      {
        type: 'number',
        required: true,
        label: 'common.rules.string.maxLen.argsLabels.1',
      },
    ],
    fn: maxLen,
    errorText: 'common.rules.string.maxLen.errorText',
  },
];

/**
 * Module name used for dynamic loading.
 * @type {String}
 */
export const module = 'string';
