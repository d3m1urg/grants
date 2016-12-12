import { fork } from 'child_process';
import path from 'path';
import { v4 as uuid } from 'uuid';

import EventEmitter from 'eventemitter3';

import { COMPILER, PROFILE } from './constants';
import Registry from './registry';
import Cache from './cache';

const { EVENT: { PROCESS, COMPILED } } = COMPILER;
const { EVENT: { INVALIDATE } } = PROFILE;

const compilerWrapper = path.join(__dirname, 'wrapper', 'compiler-wrapper');

class Hub extends EventEmitter {

  constructor() {
    super();
    this.registry = new Registry();
    this.compilerWrapper = fork(compilerWrapper);
    this.cache = new Cache();
    this.registry.on(PROCESS, profile => this.sendMessage(PROCESS, profile));
    this.registry.on(INVALIDATE, name => this.sendMessage(INVALIDATE, name));
    this.registry.on(INVALIDATE, this.cache.delete);
    this.listenToEvents();
  }

  handleProfile(profile) {
    return new Promise((resolve) => {
      if (this.registry.hasProfile(profile.name)) {
        this.registry.updateProfile(profile);
      } else {
        this.registry.registerProfile(profile);
      }
      this.once(`${profile.name}!${COMPILED}`, () => {
        resolve();
      });
    });
  }

  deleteProfile(name) {
    this.registry.deleteProfile(name);
  }

  listenToEvents() {
    this.compilerWrapper.on('message', ({ event, data: { name, entitlements } }) => {
      switch (event) {
        case COMPILED:
          this.registry.profileCompiled(name, entitlements);
          this.cache.set(name, entitlements);
          break;
        default:
          break;
      }
      this.emit(`${name}!${event}`);
    });
  }

  sendMessage(event, data) {
    this.compilerWrapper.send({ event, data });
  }

}

export default Hub;
