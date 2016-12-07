import EventEmitter from 'eventemitter3';

import { COMPILER } from './constants';
import Registry from './registry';
import Compiler from './compiler';
import Cache from './cache';

const { EVENT } = COMPILER;

class Hub extends EventEmitter {

  constructor() {
    super();
    this.registry = new Registry();
    this.compiler = new Compiler();
    this.cache = new Cache();
    this.registry.on(EVENT.PROCESS, this.compiler.process);
    this.compiler.on(EVENT.COMPILED, this.registry.profileCompiled);
    this.compiler.on(EVENT.COMPILED, this.cache.set);
    /*this.compiler.on(CEVENT.COMPILED, (name, entitlements) => {
      console.log(`Profile ${name} with entitlements`, entitlements);
    });*/
  }

  handleProfile(profile) {
    this.registry.registerProfile(profile);
  }

  deleteProfile(name) {
    this.registry.deleteProfile(name);
  }

}

export default Hub;
