import EventEmitter from 'eventemitter3';

import { STATE, EVENT } from '../constants/profile-constants';

class Profile extends EventEmitter {

  constructor({ name, entitlements = {}, dependencies = new Map(), state = STATE.INVALID, metadata = {} } = {}) {
    super();
    if (!name) {
      throw new Error(`Profile 'name' must be defined, instead got ${name}`);
    }
    this.name = name;
    this.entitlements = entitlements;
    this.dependencies = dependencies;
    this.metadata = metadata;
    this.state = state;
  }

  stateChanged(name, state) {
    if (name === this.name) {
      this.state = state;
      return;
    }
    if (state === STATE.INVALID && this.dependencies.get(name)) {
      this.state = STATE.INVALID;
      this.emit(this.name, this.name, EVENT.INVALIDATE);
    } else if (state === STATE.VALID && !this.dependencies.get(name)) {
      this.dependencies.set(name, state);
      if ([...this.dependencies].every(item => item[1])) {
        this.emit(EVENT.COMPILE, this.name);
      }
    }
  }

}

export default Profile;
