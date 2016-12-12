/* eslint-disable import/no-extraneous-dependencies, no-undef, no-unused-expressions */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Hub from '../../../dist/common/engine/hub';
import { PROFILE } from '../../../dist/common/engine/constants';

chai.use(chaiAsPromised);

const { expect } = chai;

const { STATE: { INVALID } } = PROFILE;

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
    it('should compile profiles in the correct order', () => expect(Promise.all([
      hub.handleProfile(subUserProfile),
      hub.handleProfile(teamOneProfile),
      hub.handleProfile(rootProfile),
      hub.handleProfile(userProfile),
      hub.handleProfile(teamTwoProfile),
    ])).to.eventually.be.fulfilled);
    it('should hold correct data in cache after compilation', () => {
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
    it('should hold correct correct data in cache after profile deleting', () => {
      hub.deleteProfile(teamTwoProfile.name);
      const userEnt = hub.cache.get(userProfile.name);
      const subuserEnt = hub.cache.get(subUserProfile.name);
      expect(userEnt).to.not.exist;
      expect(subuserEnt).to.not.exist;
      const userProf = hub.registry.registry.get(userProfile.name);
      const subuserProf = hub.registry.registry.get(subUserProfile.name);
      expect(userProf).to.have.property('state', INVALID);
      expect(subuserProf).to.have.property('state', INVALID);
    });
    it('should correctly restore profile', () => expect(hub.handleProfile(Object.assign({}, teamTwoProfile, { entitlements: {
      b: false,
      c: {
        d: false,
      },
    } }))).to.eventually.be.fulfilled);
    it('should hold correct data in cache after restoring', (done) => {
      const teamTwoEnt = hub.cache.get(teamTwoProfile.name);
      expect(teamTwoEnt).to.have.property('a', 1);
      expect(teamTwoEnt).to.have.property('b', false);
      expect(teamTwoEnt).to.have.deep.property('c.d', false);
      const userEnt = hub.cache.get(userProfile.name);
      expect(userEnt).to.have.property('a', 1);
      expect(userEnt).to.have.property('b', false);
      expect(userEnt).to.have.deep.property('c.d', true);
      setTimeout(() => {
        const subuserEnt = hub.cache.get(subUserProfile.name);
        expect(subuserEnt).to.have.property('a', 0);
        expect(subuserEnt).to.have.property('b', false);
        expect(subuserEnt).to.have.deep.property('c.d', true);
        done();
      }, 0);
    });
    it('should correctly update profile', () => hub.handleProfile(Object.assign({}, userProfile, { entitlements: {
      c: null,
    } })));
    it('should cache correct data after update', () => {
      const userEnt = hub.cache.get(userProfile.name);
      const subuserEnt = hub.cache.get(subUserProfile.name);
      expect(userEnt).to.have.property('a', 1);
      expect(userEnt).to.have.property('b', false);
      expect(userEnt.c).to.be.null;
      expect(subuserEnt).to.have.property('a', 0);
      expect(subuserEnt).to.have.property('b', false);
      expect(subuserEnt.c).to.be.null;
    });
  });
});
