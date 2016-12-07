import EventEmitter from 'eventemitter3';
import Profile from './profile';
import { STATE as PSTATE, EVENT as PEVENT } from '../constants/profile-constants';
import { EVENT as CEVENT } from '../constants/compiler-constants';

class Registry extends EventEmitter {

  constructor() {
    super();
    this.registry = new Map();
    // this.compiler.on(CEVENT.COMPILED, this.profileCompiled);
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
    const [canCompile, dependenciesMap] = this.canBeCompiled(rawProfile);
    const profileData = Object.assign({}, rawProfile,
      {
        dependencies: dependenciesMap,
        state: PSTATE.INVALID,
      });
    const profile = new Profile(profileData);
    this.listenToDependencies(rawProfile, profile);
    if (canCompile) {
      this.emit(CEVENT.PROCESS, rawProfile);
    }
  }

  listenToDependencies(rawProfile, profile) {
    const listeners = [...rawProfile.dependencies, profile.name];
    listeners.forEach((name) => {
      this.on(name, profile.stateChanged);
    });
  }

  /**
   * Takes raw profile as input data.
   * @param  {[type]}
   * @return {[type]}
   */
  canBeCompiled(rawProfile) {
    const dependenciesMap = new Map();
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
