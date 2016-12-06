/**
 * STATE constant contains all available Profile states:
 * - INVALID: profile was created / updated, but dependencies were not met.
 * - VALID: profile was created / updated, all dependencies met.
 * @type {Object}
 */
export const STATE = {
  INVALID: 'PROFILE_STATE_INVALID',
  VALID: 'PROFILE_STATE_VALID',
};

export const EVENT = {
  INVALIDATE: 'PROFILE_EVENT_INVALIDATE',
  COMPILE: 'PROFILE_EVENT_COMPILE',
};
