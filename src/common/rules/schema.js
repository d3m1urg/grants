const validator = require('is-my-json-valid');

/**
 * Checks an object againts provided JSON schema.
 * Note that schema is expected to be valid itself.
 * Provide input schema validation on enter.
 * @param  {Object} object Any valid JS object.
 * @param  {Object} schema JSON schema to check object against.
 * @return {boolean}       true / false depending on validation result
 */
const valid = (object, schema) => {
  const validate = validator(schema);
  return validate(object);
};

export const rules = [
  {
    name: 'valid',
    label: 'common.rules.schema.valid.label',
    description: 'common.rules.schema.valid.description',
    args: [
      {
        type: 'object',
        required: true,
        label: 'common.rules.schema.valid.argsLabels.0',
      },
      {
        type: 'object',
        required: true,
        label: 'common.rules.schema.valid.argsLabels.1',
      },
    ],
    fn: valid,
    errorText: 'common.rules.schema.valid.errorText',
  },
];

/**
 * Module name used for dynamic loading.
 * @type {String}
 */
export const module = 'schema';
