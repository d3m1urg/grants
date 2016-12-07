import EventEmitter from 'eventemitter3';

import { EVENT as CEVENT } from '../constants/compiler-constants';

import Registry from './registry';
import Compiler from './compiler';
import Cache from './cache';

class Hub extends EventEmitter {

  constructor() {
    super();
    this.registry = new Registry();
    this.compiler = new Compiler();
    this.cache = new Cache();
    this.registry.on(CEVENT.PROCESS, this.compiler.process);
    this.compiler.on(CEVENT.COMPILED, this.registry.profileCompiled);
    this.compiler.on(CEVENT.COMPILED, this.cache.set);
    /*this.compiler.on(CEVENT.COMPILED, (name, entitlements) => {
      console.log(`Profile ${name} with entitlements`, entitlements);
    });*/
  }

  handleProfile(profile) {
    this.registry.registerProfile(profile);
  }

}

export default Hub;
