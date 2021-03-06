/* eslint-disable import/no-extraneous-dependencies, no-undef, no-unused-expressions */
import util from 'util';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Compliance from '../../../src/common/engine/compliance';
import { COMPLIANCE } from '../../../src/common/engine/constants';

const { SCHEMA: { COMPLY } } = COMPLIANCE;

chai.use(chaiAsPromised);
const { expect } = chai;
const compliance = new Compliance();

const testSchema = `
  {
    "name": "entResource",
    "label": "Sample resource schema",
    "revision": "0.0.1",
    "comply": {
      "rules": ["integrity"],
      "define": [
        {
          "name": "integrity",
          "description": "Sample top-level rule",
          "fn": "value => value.ent.internalEnt >= 10 && value.ent2 <= 10",
          "args": [{ "type": "object", "required": true }],
          "errorText": "Entitlements graph incorrect"
        }
      ]
    },
    "children": [
      {
        "name": "ent",
        "label": "Simple entitlement",
        "type": "object",
        "comply":{
          "rules": [],
          "define": [
            {
              "name": "entRule",
              "description": "Sample defined rule",
              "fn": "value => value >= 0",
              "args": [{ "type": "number", "required": true }],
              "errorText": "Ent must be greater than 0"
            },
            {
              "name": "internalEnt",
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
              "rules": ["trueRule", "entRule", "internalEnt"],
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

const sampleInitEntitlements = {
  ent: {
    internalEnt: 10,
  },
  ent2: 10,
};

const sampleGoodEntitlements = {
  ent: {
    internalEnt: 50,
  },
  ent2: 7,
};

const sampleBadEntitlements = {
  ent: {
    internalEnt: 9,
  },
  ent2: 5,
};

let cache;

const schema = JSON.parse(testSchema);
const schemaExt = JSON.parse(testSchema);

describe('Compliance', () => {
  describe('#loadPredefinedRules', () => {
    it('should dynamicly load predefined rules', () => expect(compliance.loadPredefinedRules()).to.eventually.be.fulfilled);
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
      compliance.loadSchema({ schema });
      cache = compliance.rulesCache.toJS();
      const comply = compliance.complyCache.toJS();
      expect(cache).to.have.deep.property('entResource.ent.entRule');
      expect(cache).to.have.deep.property('entResource.ent.internalEnt');
      expect(cache).to.have.deep.property('entResource.ent.internalEnt.trueRule');
      expect(comply).to.have.deep.property('entResource.ent.internalEnt.@testKey@');
      expect(comply).to.have.deep.property('entResource.ent2.@testKey@');
      expect(compliance.findRule(['entResource', 'ent', 'internalEnt'], 'entRule')).to.eql(['entResource', 'ent']);
      expect(compliance.verifyEntryCompliance(['entResource', 'ent'], 7).size).to.equal(0);
      expect(compliance.verifyEntryCompliance(['entResource', 'ent', 'internalEnt'], 11).size).to.equal(0);
      expect(compliance.verifyEntryCompliance(['entResource', 'ent', 'internalEnt'], 9).size).to.equal(1);
      expect(compliance.verifyEntryCompliance(['entResource', 'ent2'], 5).size).to.equal(1);
      expect(compliance.verifyEntryCompliance(['entResource', 'ent2'], 6).size).to.equal(0);
    });
    it('should check whether values comply with rules set', () => {
      expect(compliance.verifyEntitlementsCompliance(sampleGoodEntitlements, 'entResource').size).to.equal(0);
      expect(compliance.verifyEntitlementsCompliance(sampleBadEntitlements, 'entResource').size).to.equal(2);
    });
    it('should run checks and validations in a separate context', (done) => {
      compliance.on(COMPLY, (name) => {
        expect(name).to.equal('entResource');
        done();
      });
      compliance.checkSchema({ schema: schemaExt, entitlements: sampleInitEntitlements });
    });
  });
});
