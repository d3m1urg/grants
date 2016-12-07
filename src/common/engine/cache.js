import EventEmitter from 'eventemitter3';

class Cache extends EventEmitter {

  constructor() {
    super();
    this.cache = new Map();
    this.set = this.set.bind(this);
    this.delete = this.delete.bind(this);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  get(key) {
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

}

export default Cache;
