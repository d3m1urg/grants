/**
 * STATE object contains available Profile states:
 * - INVALID: profile was created / updated, but dependencies were not met.
 * - VALID: profile was created / updated, all dependencies met.
 * @type {Object}
 */
export const STATE = {
  INVALID: 'PROFILE_STATE_INVALID',
  VALID: 'PROFILE_STATE_VALID',
};

/**
 * EVENT object contains available event identifiers for a Profile:
 * - COMPILE: emitted when Profile requests compilation due to changes in dependencies or Profile itself.
 * - UPDATED: emitted when a Profile is recompiled.
 * @type {Object}
 */
export const EVENT = {
  COMPILE: 'PROFILE_EVENT_COMPILE',
  UPDATED: 'PROFILE_EVENT_UPDATED',
};
