import { waterfall, map } from 'async';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

import EventEmitter from 'eventemitter3';
import Immutable from 'immutable';

const rulesDir = path.join(path.normalize(path.join(__dirname, '..')), 'rules');

class Compliance extends EventEmitter {

  constructor() {
    super();
    this.rulesCache = Immutable.Map({});
  }

  loadPredefinedRules() {
    return new Promise((resolve, reject) => {
      waterfall([
        (callback) => {
          fs.readdir(rulesDir, callback);
        },
        (files, callback) => {
          const filePaths = files.map(file => path.join(rulesDir, file));
          map(filePaths, fs.stat, (err, stats) => callback(err, stats, filePaths));
        },
        (stats, files, callback) => {
          const filesToProcess = stats.map((stat, index) => stat.isFile() && files[index]).filter(item => item);
          callback(null, filesToProcess);
        },
        (filesToProcess, callback) => {
          filesToProcess.forEach((fileName) => {
            try {
              const { rules, module } = require(fileName);
              rules.forEach((rule) => {
                this.rulesCache = this.rulesCache.setIn([module, rule.name], rule);
              });
            } catch (e) {
              callback(e);
            }
          });
        },
      ], (err) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  loadExternalRules(schema) {
    let curr = schema.children;
    const stack = [];
    const names = [schema.name];
    let elem;
    while (true) {
      if (curr.length > 0) {
        elem = curr.shift();
        names.push(elem.name);
      } else if (stack.length > 0) {
        curr = stack.pop();
        names.pop();
        continue;
      } else {
        break;
      }
      if (elem.comply.define.length > 0) {
        elem.comply.define.forEach((rule) => {
          names.push(rule.name);
          const script = new vm.Script(rule.fn, {
            filename: names.join('.'),
            displayErrors: true,
            timeout: 100,
          });
          const defRule = Object.assign({}, rule, {
            fn: script,
          });
          this.rulesCache = this.rulesCache.setIn(names, defRule);
          names.pop();
        });
      }
      if (elem.children && elem.children.length > 0) {
        stack.push(curr);
        curr = elem.children;
      }
    }
  }

}

export default Compliance;
