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
          "rules": ["entRule", "extRule"],
          "define": [
            {
              "name": "entRule",
              "description": "Sample defined rule",
              "fn": "value => value >= 0",
              "args": [{ "type": "number", "required": true }],
              "errorText": "Ent must be greater than 0"
            },
            {
              "name": "extRule",
              "description": "Next defined rule",
              "fn": "value => value < 100",
              "args": [{ "type": "number", "required": true }],
              "errorText": "Ent must be less than 100"
            }
          ]
        },
        "children": [
          {
            "name": "internalEnt",
            "label": "Simple internal entitlement",
            "type": "number",
            "init": 10,
            "comply":{
              "rules": ["trueRule", "entRule", "extRule"],
              "define": [
                {
                  "name": "trueRule",
                  "description": "Sample internal rule",
                  "fn": "value => value >= 10",
                  "args": [{ "type": "number", "required": true }],
                  "errorText": "Ent must be greater or equal to 10"
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
        "init": 10,
        "comply":{
          "rules": ["number.int", ["number.min", 5, false]]
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
      const comply = compliance.complyCache.toJS();
      // console.log(util.inspect(comply, { depth: null }));
      // console.log(util.inspect(cache, { depth: null }));
      expect(cache).to.have.deep.property('entResource.ent.entRule');
      expect(cache).to.have.deep.property('entResource.ent.extRule');
      expect(cache).to.have.deep.property('entResource.ent.internalEnt.trueRule');
      expect(comply).to.have.deep.property('entResource.ent.@testKey@');
      expect(comply).to.have.deep.property('entResource.ent.internalEnt.@testKey@');
      expect(comply).to.have.deep.property('entResource.ent2.@testKey@');
      expect(compliance.findRule(['entResource', 'ent', 'internalEnt'], 'entRule')).to.eql(['entResource', 'ent']);
      expect(compliance.verifyEntryCompliance(['entResource', 'ent'], 7)).to.be.true;
      expect(compliance.verifyEntryCompliance(['entResource', 'ent', 'internalEnt'], 11)).to.be.true;
      expect(compliance.verifyEntryCompliance(['entResource', 'ent', 'internalEnt'], 9)).to.be.false;
      expect(compliance.verifyEntryCompliance(['entResource', 'ent2'], 5)).to.be.false;
      expect(compliance.verifyEntryCompliance(['entResource', 'ent2'], 6)).to.be.true;
    });
  });
});
