/**
 * Checks whether the provided value is a finite number.
 * @param  {Number} value Value to check.
 * @return {Boolean}      true for a finite number, false - otherwise.
 */
const num = value => Number.isFinite(value);

/**
 * Checks whether provided is value a number which is:
 *   - finite
 *   - greater or equal to minimal value
 * @param  {Number}  value    The number to check.
 * @param  {Number}  minValue The minimal valid value to check against.
 * @return {Boolean}          Whether 'value' is greater or equal to 'minValue'
 */
const min = (value, minValue) =>
  Number.isFinite(value) && (value >= minValue);

/**
 * Checks whether provided is value a number which is:
 *   - finite
 *   - less or equal to maximum value
 * @param  {Number}  value    The number to check.
 * @param  {Number}  maxValue The maximum valid value to check against.
 * @return {Boolean}          Whether 'value' is less or equal to 'maxValue'
 */
const max = (value, maxValue) =>
  Number.isFinite(value) && (value <= maxValue);

/**
 * Checks whether the provided value is a safe integer in terms of JavaScript
 * (-(2^53 - 1) < value < 2^53 - 1).
 * @param  {Number} value The value to check
 * @return {Boolean}      true if 'value' is safe integer, false otherwise
 */
const int = value => Number.isSafeInteger(value);

/**
 * Checks whether the provided value has specified precision.
 * @param  {Number} value The value to check.
 * @param  {Number} prec  Number of digits after '.'
 * @return {[type]}       true is the number of digits equals 'prec', false otherwise
 */
const precision = (value, prec) =>
  (String(value).search(new RegExp(`^[0-9]+.([0-9]{${prec}})$`)) >= 0);

/**
 * Exported array holds objects describing built-in rules.
 * It helps validating schemas obtained from external APIs to comply with the provided rule checking API.
 * Each object in 'define' array has the following shape:
 *   {
 *     name:          'string'    -> a short rule name, almost always - the function name
 *     description:   'string'    -> i18n-aware description used for ui. It may be a template. Is a '.'-separated deep key for Immutable.Map()
 *     args:          'array'     -> array of argument's rules the input must be validated against
 *     fn:            'function'  -> validations function itself
 *     errorText:     'string'    -> Error text shown when entered value do not comply with the rule.
 *   }
 * args containing a set of objects of the following shape:
 *   {
 *     type:      "boolean"|"number"|"string"|"array"|"object"|"null"  -> any valid JSON type.
 *     required:  true|false                                           -> whether this argument is mandatory or not.
 *   }
 * @type {Array}
 */
export const rules = [
  {
    name: 'num',
    label: 'common.rules.number.num.label',
    description: 'common.rules.number.num.description',
    args: [
      {
        type: 'number',
        required: true,
        label: 'common.rules.number.num.argsLabels.0',
      },
    ],
    fn: num,
    errorText: 'common.rules.number.num.errorText',
  },
  {
    name: 'min',
    label: 'common.rules.number.min.label',
    description: 'common.rules.number.min.description',
    args: [
      {
        type: 'number',
        required: true,
        label: 'common.rules.number.min.argsLabels.0',
      },
      {
        type: 'number',
        required: true,
        label: 'common.rules.number.min.argsLabels.1',
      },
    ],
    fn: min,
    errorText: 'common.rules.number.min.errorText',
  },
  {
    name: 'max',
    label: 'common.rules.number.max.label',
    description: 'common.rules.number.max.description',
    args: [
      {
        type: 'number',
        required: true,
        label: 'common.rules.number.max.argsLabels.0',
      },
      {
        type: 'number',
        required: true,
        label: 'common.rules.number.max.argsLabels.1',
      },
    ],
    fn: max,
    errorText: 'common.rules.number.max.errorText',
  },
  {
    name: 'int',
    label: 'common.rules.number.int.label',
    description: 'common.rules.number.int.description',
    args: [
      {
        type: 'number',
        required: true,
        label: 'common.rules.number.int.argsLabels.0',
      },
    ],
    fn: int,
    errorText: 'common.rules.number.int.errorText',
  },
  {
    name: 'precision',
    label: 'common.rules.number.precision.label',
    description: 'common.rules.number.precision.description',
    args: [
      {
        type: 'number',
        required: true,
        label: 'common.rules.number.precision.argsLabels.0',
      },
      {
        type: 'number',
        required: true,
        label: 'common.rules.number.precision.argsLabels.1',
      },
    ],
    fn: precision,
    errorText: 'common.rules.number.precision.errorText',
  },
];

/**
 * Module name used for dynamic loading.
 * @type {String}
 */
export const module = 'number';
