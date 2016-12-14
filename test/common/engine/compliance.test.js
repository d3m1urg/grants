/* eslint-disable import/no-extraneous-dependencies, no-undef, no-unused-expressions */
import util from 'util';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Compliance from '../../../src/common/engine/compliance';

chai.use(chaiAsPromised);
const { expect } = chai;
const compliance = new Compliance();

const testSchema = `
  {
    "name": "entResource",
    "label": "Sample resource schema",
    "revision": "0.0.1",
    "children": [
      {
        "name": "ent",
        "label": "Simple entitlement",
        "type": "number",
        "init": 0,
        "comply":{
          "rules": ["entRule"],
          "define": [
            {
              "name": "entRule",
              "description": "Sample defined rule",
              "fn": "function e(value) { return value > 0; }",
              "args": [{ "type": "number", "required": true }],
              "errorText": "Ent must be greater than 0"
            }
          ]
        },
        "children": [
          {
            "name": "internalEnt",
            "label": "Simple internal entitlement",
            "type": "boolean",
            "init": false,
            "comply":{
              "rules": ["trueRule"],
              "define": [
                {
                  "name": "trueRule",
                  "description": "Sample internal rule",
                  "fn": "function e(value) { return value === true; }",
                  "args": [{ "type": "boolean", "required": true }],
                  "errorText": "Ent must be true"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "ent2",
        "label": "Simple entitlement 2",
        "type": "number",
        "init": 0,
        "comply":{
          "rules": ["number.int"]
        }
      }
    ]
  }
`;

let cache;

describe('Compliance', () => {
  describe('#loadPredefinedRules', () => {
    it('should dynamicly load predefined rules', () => {
      expect(compliance.loadPredefinedRules()).to.eventually.be.fulfilled;
    });
  });
  describe('#rulesCache', () => {
    it('should contain correct rules', () => {
      cache = compliance.rulesCache.toJS();
      expect(cache).to.have.deep.property('number.min');
      expect(cache).to.have.deep.property('number.max');
      expect(cache).to.have.deep.property('number.int');
      expect(cache).to.have.deep.property('number.precision');
      expect(cache).to.have.deep.property('string.regexp');
      expect(cache).to.have.deep.property('string.minLen');
      expect(cache).to.have.deep.property('string.maxLen');
    });
  });
  describe('#definedRules', () => {
    it('should correctly load user defined rules', () => {
      const schema = JSON.parse(testSchema);
      compliance.loadExternalRules(schema);
      cache = compliance.rulesCache.toJS();
      console.log(util.inspect(cache, {depth: null}));
      expect(cache).to.have.deep.property('entResource.ent.entRule');
      expect(cache).to.have.deep.property('entResource.ent.internalEnt.trueRule');
    });
  });
});
