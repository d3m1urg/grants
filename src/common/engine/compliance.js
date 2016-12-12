import EventEmitter from 'eventemitter3';
import Immutable from 'immutable';

class Compliance extends EventEmitter {

  constructor() {
    super();
    this.rules = Immutable.Map({});
  }

  execute() {
    
  }

}

export default Compliance;
