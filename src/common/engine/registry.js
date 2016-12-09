import EventEmitter from 'eventemitter3';
import Profile from './profile';
import { COMPILER, PROFILE } from './constants';

const { EVENT: { PROCESS } } = COMPILER;
const { STATE: { VALID, INVALID }, EVENT: { COMPILE, INVALIDATE } } = PROFILE;

class Registry extends EventEmitter {

  constructor() {
    super();
    this.registry = new Map();
    this.profileCompiled = this.profileCompiled.bind(this);
  }

  profileCompiled(name) {
    this.emit(name, name, VALID);
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
    const [canCompile, dependenciesMap] = this.canBeCompiled(rawProfile);
    const profileData = Object.assign({}, rawProfile,
      {
        dependencies: dependenciesMap,
        state: INVALID,
        entitlements: {},
        raw: rawProfile,
      });
    const profile = new Profile(profileData);
    this.enableListeners(rawProfile, profile);
    this.registry.set(profile.name, profile);
    if (canCompile) {
      this.emit(PROCESS, rawProfile);
    }
  }

  enableListeners(rawProfile, profile) {
    const listeners = Array.isArray(rawProfile.dependencies) ? [...rawProfile.dependencies, profile.name] : [profile.name];
    listeners.forEach((name) => {
      this.on(name, profile.stateChanged);
    });
    profile.on(COMPILE, (name) => {
      this.emit(PROCESS, this.registry.get(name).raw);
    });
    profile.on(INVALIDATE, (name) => {
      this.emit(name, name, INVALID);
      this.emit(INVALIDATE, name);
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
        isDepReady = this.registry.get(depName).state === VALID;
      }
      dependenciesMap.set(depName, isDepReady);
    });
    const canCompile = [...dependenciesMap.values()].every(item => item);
    return [canCompile, dependenciesMap];
  }

  updateProfile(rawProfile) {
    this.deleteProfile(rawProfile.name);
    this.registerProfile(rawProfile);
  }

  deleteProfile(name) {
    this.emit(name, name, INVALID);
    const profile = this.registry.get(name);
    const rawProfile = profile.raw;
    const listeners = Array.isArray(rawProfile.dependencies) ? [...rawProfile.dependencies, profile.name] : [profile.name];
    listeners.forEach((lname) => {
      this.removeListener(lname, profile.stateChanged);
    });
    profile.removeAllListeners(COMPILE);
    this.registry.delete(name);
  }

  hasProfile(name) {
    return this.registry.has(name);
  }

}

export default Registry;
