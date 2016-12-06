import EventEmitter from 'eventemitter3';
import Profile from './profile';

class Registry extends EventEmitter {

  constructor() {
    super();
    this.registry = new Map();
  }

}

export default Registry;
