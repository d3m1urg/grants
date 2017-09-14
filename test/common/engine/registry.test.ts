/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import * as uuid from 'uuid/v4';

import { RegularEntitlement } from '../../../src/common/engine/entitlement';
import { LocalRegistry } from '../../../src/common/engine/registry';

import { ENTITLEMENT } from '../../../src/common/engine/constants';

let registry: LocalRegistry;
let entitlement1: RegularEntitlement;
let entitlement2: RegularEntitlement;

const own1 = {
    role: 'admin',
    param1: 123,
};

const own2 = {
    role: 'admin',
    param1: 1234,
};

describe('Create new registry', () => {
    it('should not create a new Registry with incorrect serviceId', () => {
        try {
            const incorrectServiceId = '123';
            registry = new LocalRegistry(incorrectServiceId);
        } catch (e) {
        } finally {
            expect(registry).to.be.undefined;
        }
    });
    it('should create a new Registry with correct (uuid v.4) serviceId', () => {
        const correctServiceId = uuid();
        registry = new LocalRegistry(correctServiceId);
        expect(registry).to.exist;
    });
});

describe('Add entitlements to the registry', () => {
    it('should add new entitlement with no dependencies', () => {
        const newId = registry.generateEntitlementId();
        entitlement1 = new RegularEntitlement(newId, own1, []);
        let val = null;
        const cb = (ent) => {
            val = ent;
        };
        registry.on(ENTITLEMENT.ADD.OK, cb);
        registry.addEntitlement(entitlement1);
        expect(val).to.equal(entitlement1);
    });
    it('should correctly handle sucessfull compile / validation event', () => {
        let val: RegularEntitlement = null;
        const validate = (ent: RegularEntitlement) => {
            ent.onStateChanged(ENTITLEMENT.VALIDATE.OK);
        };
        const cb = (action: string, ent: RegularEntitlement) => {
            val = ent;
        }
        entitlement1.on(ENTITLEMENT.VALIDATE.NOW, validate);
        entitlement1.on(entitlement1.id, cb);
        entitlement1.onStateChanged(ENTITLEMENT.COMPILE.OK, own1);
        expect(val).to.equal(entitlement1);
        expect(val.is(ENTITLEMENT.IS.ACTIVE | ENTITLEMENT.IS.COMPILED | ENTITLEMENT.IS.VALID)).to.be.true;
    });
    it('should add new entitlement with one dependency', () => {
        const newId = registry.generateEntitlementId();
        entitlement2 = new RegularEntitlement(newId, own2, [entitlement1.id]);
        let val = null;
        const cb = (ent) => {
            val = ent;
        };
        registry.on(ENTITLEMENT.ADD.OK, cb);
        registry.addEntitlement(entitlement2);
        expect(val).to.equal(entitlement2);
    });
    it('should emit invalidation event when dependency is deleted', () => {
        let val = null;
        const cb = (ent) => {
            val = ent;
        };
        registry.on(ENTITLEMENT.STATE.INVALID, cb);
        registry.deleteEntitlement(entitlement1.id);
        expect(val).to.equal(entitlement2);
    });
    /* it('should correctly restore entitlement', () => {
        let val = null;
        const cb = (ent) => {
            val = ent;
        };
        registry.on(ENTITLEMENT.ADD.OK, cb);
        registry.on(ENTITLEMENT.ADD.ERROR, msg => console.log(msg));
        registry.addEntitlement(entitlement1);
        expect(val).to.equal(entitlement1);
    }); */
});
