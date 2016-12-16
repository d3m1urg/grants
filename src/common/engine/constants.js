/**
 * PROFILE constants
 * STATE object contains available Profile states:
 * - INVALID: profile was created / updated, but dependencies were not met.
 * - VALID: profile was created / updated, all dependencies met.
 * EVENT object contains available event identifiers for a Profile:
 * - COMPILE: emitted when Profile requests compilation due to changes in dependencies or Profile itself.
 * - INVALIDATED: emitted when a Profile becomes invalid due to dependencies invalidation.
 * @type {Object}
 */
export const PROFILE = {
  STATE: {
    INVALID: 'PROFILE_STATE_INVALID',
    VALID: 'PROFILE_STATE_VALID',
  },
  EVENT: {
    COMPILE: 'PROFILE_EVENT_COMPILE',
    INVALIDATE: 'PROFILE_EVENT_INVALIDATE',
  },
};

export const COMPILER = {
  EVENT: {
    PROCESS: 'COMPILER_EVENT_PROCESS',
    COMPILED: 'COMPILER_EVENT_COMPILED',
  },
};

export const ERROR = {
  RULE: {
    COMPILE: 'ERROR_RULE_COMPILE',
  },
  SCHEMA: {
    VERIFY: 'ERROR_SCHEMA_VERIFY',
  }
};
