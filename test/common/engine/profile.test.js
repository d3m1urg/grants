/* eslint-disable import/no-extraneous-dependencies, no-undef, no-unused-expressions */
import { expect } from 'chai';
import Profile from '../../../src/common/engine/profile';

describe('Profile', () => {
  describe('#constructor', () => {
    it('should successfully create Profile instance with correct default values', () => {
      const profile = new Profile({ name: 'testname' });
      expect(profile).to.exist;
    });
  });
});
