import EventEmitter from 'eventemitter3';

import { PROFILE } from './constants';

const { STATE: { INVALID, VALID }, EVENT: { INVALIDATE, COMPILE } } = PROFILE;

class Profile extends EventEmitter {

  constructor({
    name, entitlements = {}, dependencies = new Map(),
    state = INVALID, raw = {}, metadata = {} } = {}) {
    super();
    if (!name) {
      throw new Error(`Profile 'name' must be defined, instead got ${name}`);
    }
    this.name = name;
    this.entitlements = entitlements;
    this.dependencies = dependencies;
    this.state = state;
    this.raw = raw;
    this.metadata = metadata;
    this.stateChanged = this.stateChanged.bind(this);
  }

  stateChanged(name, state) {
    if (name === this.name && this.state !== state) {
      this.state = state;
      return;
    }
    if (state === INVALID && this.dependencies.get(name) === VALID) {
      this.state = state;
      this.dependencies.set(name, state);
      this.emit(INVALIDATE, this.name);
    } else if (state === VALID && this.dependencies.get(name) === INVALID) {
      this.dependencies.set(name, state);
      if (this.canCompile()) {
        this.emit(COMPILE, this.name);
      }
    }
  }

  canCompile() {
    return [...this.dependencies.values()].every(item => item === VALID);
  }

}

export default Profile;
