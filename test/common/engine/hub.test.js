/* eslint-disable import/no-extraneous-dependencies, no-undef, no-unused-expressions */
import { expect } from 'chai';
import Hub from '../../../src/common/engine/hub';

const rootProfile = {
  name: 'root',
  entitlements: {
    a: 1,
    b: true,
    c: {
      d: true,
    },
  },
};

const teamOneProfile = {
  name: 'teamOne',
  entitlements: {
    b: false,
  },
  dependencies: ['root'],
};

const teamTwoProfile = {
  name: 'teamTwo',
  entitlements: {
    b: true,
    c: {
      d: false,
    },
  },
  dependencies: ['root'],
};

const userProfile = {
  name: 'user',
  entitlements: {
    c: {
      d: true,
    },
  },
  dependencies: ['teamOne', 'teamTwo'],
};

const subUserProfile = {
  name: 'subuser',
  entitlements: {
    a: 0,
  },
  dependencies: ['user'],
};

const hub = new Hub();

describe('Hub', () => {
  describe('Profiles compilation', () => {
    it('should compile profiles in the correct order', () => {
      hub.handleProfile(subUserProfile);
      hub.handleProfile(teamOneProfile);
      hub.handleProfile(rootProfile);
      hub.handleProfile(userProfile);
      hub.handleProfile(teamTwoProfile);
      const rootEnt = hub.cache.get(rootProfile.name);
      const teamOneEnt = hub.cache.get(teamOneProfile.name);
      const teamTwoEnt = hub.cache.get(teamTwoProfile.name);
      const userEnt = hub.cache.get(userProfile.name);
      const subuserEnt = hub.cache.get(subUserProfile.name);
      expect(rootEnt).to.have.property('a', 1);
      expect(rootEnt).to.have.property('b', true);
      expect(rootEnt).to.have.deep.property('c.d', true);
      expect(teamOneEnt).to.have.property('a', 1);
      expect(teamOneEnt).to.have.property('b', false);
      expect(teamOneEnt).to.have.deep.property('c.d', true);
      expect(teamTwoEnt).to.have.property('a', 1);
      expect(teamTwoEnt).to.have.property('b', true);
      expect(teamTwoEnt).to.have.deep.property('c.d', false);
      expect(userEnt).to.have.property('a', 1);
      expect(userEnt).to.have.property('b', true);
      expect(userEnt).to.have.deep.property('c.d', true);
      expect(subuserEnt).to.have.property('a', 0);
      expect(subuserEnt).to.have.property('b', true);
      expect(subuserEnt).to.have.deep.property('c.d', true);
    });
    it('should correctly handle profile deletes', () => {
      hub.deleteProfile(teamOneProfile.name);
      console.log(hub.registry.registry);
    });
  });
});
