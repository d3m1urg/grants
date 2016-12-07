import EventEmitter from 'eventemitter3';

import { COMPILER, PROFILE } from './constants';
import Registry from './registry';
import Compiler from './compiler';
import Cache from './cache';

const { EVENT: { PROCESS, COMPILED } } = COMPILER;
const { EVENT: { INVALIDATE } } = PROFILE;

class Hub extends EventEmitter {

  constructor() {
    super();
    this.registry = new Registry();
    this.compiler = new Compiler();
    this.cache = new Cache();
    this.registry.on(PROCESS, this.compiler.process);
    this.compiler.on(COMPILED, this.registry.profileCompiled);
    this.compiler.on(COMPILED, this.cache.set);
    this.registry.on(INVALIDATE, this.compiler.delete);
    this.registry.on(INVALIDATE, this.cache.delete);
  }

  handleProfile(profile) {
    if (this.registry.hasProfile(profile.name)) {
      this.registry.updateProfile(profile);
    } else {
      this.registry.registerProfile(profile);
    }
  }

  deleteProfile(name) {
    this.registry.deleteProfile(name);
  }

}

export default Hub;
