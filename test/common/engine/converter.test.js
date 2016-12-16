/* eslint-disable import/no-extraneous-dependencies, no-undef, no-unused-expressions */
import { expect } from 'chai';

import convert from '../../../src/common/engine/converter';

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

const schema = JSON.parse(testSchema);

describe('Converter', () => {
  describe('#convert', () => {
    it('should correctly transform schema into root entitlements object', () => {
      const ent = convert(schema);
      expect(ent).to.have.deep.property('ent.internalEnt', 10);
      expect(ent).to.have.property('ent2', 10);
    });
  });
});
