/* eslint-disable no-constant-condition, no-continue,
global-require, import/no-dynamic-require, no-plusplus */
import { waterfall, map } from 'async';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import VError from 'verror';

import EventEmitter from 'eventemitter3';
import Immutable from 'immutable';

import { ERROR } from './constants';

const { RULE: { COMPILE } } = ERROR;

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
 */
class Compliance extends EventEmitter {

  constructor() {
    super();
    this.rulesCache = Immutable.Map({});
    this.complyCache = Immutable.Map({});
    this.builtInRules = null;
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
          const filesToProcess = stats.map((stat, index) => stat.isFile() &&
            files[index]).filter(item => item);
          callback(null, filesToProcess);
        },
        (filesToProcess, callback) => {
          filesToProcess.forEach((fileName) => {
            try {
              const { rules, module } = require(fileName);
              rules.forEach((rule) => {
                this.rulesCache = this.rulesCache.setIn([module, rule.name, rulesKey], rule);
              });
            } catch (e) {
              callback(e);
            }
          });
          callback(null);
        },
      ], (err) => {
        if (!err) {
          this.builtInRules = this.rulesCache;
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  loadExternalRootRules(schema) {
    if (!schema.comply) {
      return;
    }
    const names = [schema.name];
    if (!this.complyCache.hasIn(names)) {
      this.complyCache = this.complyCache.setIn(names, Immutable.Map({}));
    }
    this.complyCache = this.complyCache.setIn([...names, rulesKey], schema.comply.rules);
    if (schema.comply.define && schema.comply.define.length > 0) {
      schema.comply.define.forEach((rule) => {
        try {
          names.push(rule.name);
          const fn = vm.runInNewContext(rule.fn, {}, {
            filename: names.join('.'),
            displayErrors: true,
            timeout: 100,
          });
          const defRule = Object.assign({}, rule, { fn });
          this.rulesCache = this.rulesCache.setIn([...names, rulesKey], defRule);
          names.pop();
        } catch (e) {
          throw new VError({
            name: COMPILE,
            cause: e,
            strict: true,
            info: {
              schema: schema.name,
              path: names,
              rule: rule.name,
              fn: rule.fn,
            },
          }, 'Failed to compile "%s" rule at root', rule.name);
        }
      });
    }
  }

  loadExternalRules(schema) {
    let curr = [...schema.children];
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
      if (!this.complyCache.hasIn(names)) {
        this.complyCache = this.complyCache.setIn(names, Immutable.Map({}));
      }
      this.complyCache = this.complyCache.setIn([...names, rulesKey], elem.comply.rules);
      if (elem.comply.define && elem.comply.define.length > 0) {
        elem.comply.define.forEach((rule) => {
          try {
            names.push(rule.name);
            const fn = vm.runInNewContext(rule.fn, {}, {
              filename: names.join('.'),
              displayErrors: true,
              timeout: 100,
            });
            const defRule = Object.assign({}, rule, { fn });
            this.rulesCache = this.rulesCache.setIn([...names, rulesKey], defRule);
            names.pop();
          } catch (e) {
            throw new VError({
              name: COMPILE,
              cause: e,
              strict: true,
              info: {
                schema: schema.name,
                path: names,
                rule: rule.name,
                fn: rule.fn,
              },
            }, 'Failed to compile "%s" rule', rule.name);
          }
        });
      }
      if (elem.children && elem.children.length > 0) {
        stack.push(curr);
        curr = [...elem.children];
      }
    }
  }

  findRule(rulePath, rule) {
    for (let i = rulePath.length; i >= 0; i--) {
      if (this.rulesCache.hasIn([...rulePath.slice(0, i), rule])) {
        return rulePath.slice(0, i);
      }
    }
    return null;
  }

  verifyEntryCompliance(rpath, value) {
    if (!this.complyCache.hasIn(rpath)) {
      return new Set();
    }
    const rules = this.complyCache.getIn([...rpath, rulesKey]).map((item) => {
      let rulePath = [];
      let ruleName = item;
      let args = [];
      let resolvedRule = null;
      if (Array.isArray(item)) {
        ruleName = item[0];
        args = item.slice(1);
      }
      if (ruleName.indexOf('.') > 0) {
        rulePath = ruleName.split('.');
        resolvedRule = this.rulesCache.getIn([...rulePath, rulesKey]);
      } else {
        rulePath = this.findRule([...rpath], ruleName);
        resolvedRule = this.rulesCache.getIn([...rulePath, ruleName, rulesKey]);
      }
      return [resolvedRule, rulePath, args];
    });
    const errors = new Set();
    rules.forEach((rl) => {
      const [ruleObj, rulePath, args] = rl;
      if (!ruleObj.fn(value, ...args)) {
        errors.add([rulePath, value, ruleObj]);
      }
    });
    return errors;
  }

  verifyRootCompliance(entitlements, resource) {
    if (!this.complyCache.hasIn([resource, rulesKey])) {
      return new Set();
    }
    return this.verifyEntryCompliance([resource], entitlements);
  }

  verifyEntitlementsCompliance(entitlements, resource) {
    const keysStack = [];
    const objStack = [];
    let currentKeys = Object.keys(entitlements);
    let currentObj = entitlements;
    let key = null;
    let value = null;
    const names = [resource];
    const incorrectValues = new Set();
    while (true) {
      if (currentKeys.length > 0) {
        key = currentKeys.shift();
        value = currentObj[key];
        names.push(key);
      } else if (objStack.length > 0) {
        currentObj = objStack.pop();
        currentKeys = keysStack.pop();
        names.pop();
        continue;
      } else {
        break;
      }
      if (typeof value === 'object' && !(value instanceof Array)) {
        keysStack.push(currentKeys);
        objStack.push(currentObj);
        currentKeys = Object.keys(value);
        currentObj = value;
      } else {
        const errors = this.verifyEntryCompliance(names, value);
        if (errors.size > 0) {
          incorrectValues.add([[...names], errors]);
        }
        names.pop();
      }
    }
    return incorrectValues;
  }

  verifySchemaCompliance(schema, entitlements, resource) {
    const context = {
      rulesCache: this.builtInRules,
      complyCache: Immutable.Map({}),
      findRule: this.findRule,
      verifyEntryCompliance: this.verifyEntryCompliance,
    };
    try {
      this.loadExternalRootRules.call(context, schema);
      this.loadExternalRules.call(context, schema);
    } catch (err) {
      return [new VError(err, 'Failed to load schema "%s"', schema.name), null, null];
    }
    const rootErrs = this.verifyRootCompliance.call(context, entitlements, resource);
    const entErrs = this.verifyEntitlementsCompliance.call(context, entitlements, resource);
    return [null, rootErrs, entErrs];
  }

}

export default Compliance;
