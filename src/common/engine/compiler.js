import EventEmitter from 'eventemitter3';
import Immutable from 'immutable';

import { COMPILER } from './constants';

const { EVENT: { COMPILED } } = COMPILER;

class Compiler extends EventEmitter {

  constructor() {
    super();
    this.cache = Immutable.Map({});
    this.process = this.process.bind(this);
  }

  process(profile) {
    let compiledProfile;
    if (!profile.dependencies || profile.dependencies.length === 0) {
      compiledProfile = Immutable.fromJS(profile.entitlements);
      this.cache = this.cache.set(profile.name, compiledProfile);
    } else {
      const profilesList = [...profile.dependencies.map(name => this.cache.get(name)), Immutable.fromJS(profile.entitlements)];
      compiledProfile = profilesList.reduce((prev, next) => prev.mergeDeepWith((no, yes) => yes, next));
      this.cache = this.cache.set(profile.name, compiledProfile);
    }
    this.emit(COMPILED, profile.name, compiledProfile.toJS());
  }

  remove(name) {
    this.cache = this.cache.delete(name);
  }

}

export default Compiler;
