import EventEmitter from 'eventemitter3';
import Immutable from 'immutable';

import { EVENT } from '../constants/compiler-constants';

class Compiler extends EventEmitter {

  constructor() {
    super();
    this.cache = Immutable.Map({});
    this.process = this.process.bind(this);
  }

  process(profile) {
    if (profile.dependencies.length === 0) {
      this.cache = this.cache.set(profile.name,
        Immutable.fromJS(profile.entitlements));
    } else {
      const profilesList = [...profile.dependencies.map(name => this.cache.get(name)), Immutable.fromJS(profile.entitlements)];
      const compiledProfile = profilesList.reduce((prev, next) => prev.mergeDeepWith((no, yes) => yes, next));
      this.cache = this.cache.set(profile.name, compiledProfile);
    }
    this.emit(EVENT.COMPILED, profile.name);
  }

  remove(name) {
    this.cache = this.cache.delete(name);
  }

}

export default Compiler;
