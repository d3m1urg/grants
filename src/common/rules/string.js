const regexp = (value, regex) => (value.search(regex) >= 0);

const minLen = (value, min, include = true) => (include ? value.length >= min : value.length > min);

const maxLen = (value, max, include = true) => (include ? value.length <= max : value.length < max);

export const rules = [
  {
    name: 'regexp',
    description: 'common.rules.string.regexp.description',
    args: [{ type: 'string', required: true }, { type: 'number', required: true }],
    fn: regexp,
    errorText: 'common.rules.string.regexp.errorText',
  },
  {
    name: 'minLen',
    description: 'common.rules.string.minLen.description',
    args: [{ type: 'string', required: true }, { type: 'number', required: true }, { type: 'boolean', required: false }],
    fn: minLen,
    errorText: 'common.rules.string.minLen.errorText',
  },
  {
    name: 'maxLen',
    description: 'common.rules.string.maxLen.description',
    args: [{ type: 'string', required: true }, { type: 'number', required: true }, { type: 'boolean', required: false }],
    fn: maxLen,
    errorText: 'common.rules.string.maxLen.errorText',
  },
];

/**
 * Module name used for dynamic loading.
 * @type {String}
 */
export const module = 'string';
