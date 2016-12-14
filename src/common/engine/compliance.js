import { waterfall, map } from 'async';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

import EventEmitter from 'eventemitter3';
import Immutable from 'immutable';

const rulesDir = path.join(path.normalize(path.join(__dirname, '..')), 'rules');

const rulesKey = Object.create({
  toString: () => '@testKey@',
});

/**
 * Rules in the rules list are parsed in the following manner:
 * - if it has a '.' - then it is expected to be a predefined rule
 * - if it has no '.' - it is expected to be user-defined rule. User-defined rules
 * are searched throughout the tree from bottom to top (as variables in js scope)
 * If no matching rule found an Error is thrown.
 * @todo Move rules dir to config file
 * @todo Resource schema should pass all rules with init values.
 * @todo  If script can not compile it throws error - that must not crash app.
 */
class Compliance extends EventEmitter {

  constructor() {
    super();
    this.rulesCache = Immutable.Map({});
    this.complyCache = Immutable.Map({});
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
        if (names.length !== 1 && stack.length === 0) {
          names.pop();
        }
        elem = curr.shift();
        names.push(elem.name);
      } else if (stack.length > 0) {
        curr = stack.pop();
        names.pop();
        continue;
      } else {
        break;
      }
      if (elem.comply.rules.length > 0) {
        if (!this.complyCache.hasIn(names)) {
          this.complyCache = this.complyCache.setIn(names, Immutable.Map({}));
        }
        this.complyCache = this.complyCache.setIn([...names, rulesKey], elem.comply.rules);
      }
      if (elem.comply.define && elem.comply.define.length > 0) {
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

  verifyCompliance() {

  }

}

export default Compliance;
