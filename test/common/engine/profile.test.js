import { expect } from 'chai';
import Profile from '../../../src/common/engine/profile';

describe('Profile', () => {
  describe('#constructor', () => {
    it('should successfully create Profile instance with correct default values', () => {
      const profile = new Profile();
      expect(profile).to.exist;
    });
  });
});
