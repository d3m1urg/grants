import EventEmitter from 'eventemitter3';
import Profile from './profile';
import { STATE as PSTATE, EVENT as PEVENT } from '../constants/profile-constants';
import { EVENT as CEVENT } from '../constants/compiler-constants';

class Registry extends EventEmitter {

  constructor() {
    super();
    this.registry = new Map();
    this.raw = new Map();
    this.profileCompiled = this.profileCompiled.bind(this);
  }

  profileCompiled(name) {
    this.emit(name, name, PSTATE.VALID);
  }

  /**
   * rawProfile has the following shape:
   * {
   *    name: 'string',
   *    entitlements: {},
   *    dependencies: [], -> dependencies must be sorted according to priorities, from least to most
   *    metadata: {}
   * }
   * @param  {[type]}
   * @return {[type]}
   */
  registerProfile(rawProfile) {
    this.raw.set(rawProfile.name, rawProfile);
    const [canCompile, dependenciesMap] = this.canBeCompiled(rawProfile);
    const profileData = Object.assign({}, rawProfile,
      {
        dependencies: dependenciesMap,
        state: PSTATE.INVALID,
      });
    const profile = new Profile(profileData);
    this.enableListeners(rawProfile, profile);
    this.registry.set(profile.name, profile);
    if (canCompile) {
      this.emit(CEVENT.PROCESS, rawProfile);
    }
  }

  enableListeners(rawProfile, profile) {
    const listeners = Array.isArray(rawProfile.dependencies) ? [...rawProfile.dependencies, profile.name] : [profile.name];
    listeners.forEach((name) => {
      this.on(name, profile.stateChanged);
    });
    profile.on(PEVENT.COMPILE, (name) => {
      this.emit(CEVENT.PROCESS, this.raw.get(name));
    });
  }

  /**
   * Takes raw profile as input data.
   * @param  {[type]}
   * @return {[type]}
   */
  canBeCompiled(rawProfile) {
    const dependenciesMap = new Map();
    if (!rawProfile.dependencies || rawProfile.dependencies.length === 0) {
      return [true, dependenciesMap];
    }
    rawProfile.dependencies.forEach((depName) => {
      let isDepReady = false;
      if (this.registry.has(depName)) {
        isDepReady = this.registry.get(depName).state === PSTATE.VALID;
      }
      dependenciesMap.set(depName, isDepReady);
    });
    const canCompile = [...dependenciesMap.values()].every(item => item);
    return [canCompile, dependenciesMap];
  }

  getProfile() {

  }

  updateProfile() {

  }

  deleteProfile() {

  }

}

export default Registry;
