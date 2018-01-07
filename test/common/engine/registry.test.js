/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { RegularEntitlement } from '../../../src/common/engine/entitlement';
import { LocalRegistry } from '../../../src/common/engine/registry';
import { COMPILER, ENTITLEMENT } from '../../../src/common/engine/constants';
let registry;
let entitlement1;
let entitlement2;
const own1 = {
    role: 'admin',
    param1: 123,
};
const own2 = {
    role: 'admin',
    param1: 1234,
};
describe('New Registry', () => {
    it('should not be created with an incorrect serviceId', () => {
        try {
            const incorrectServiceId = '123';
            registry = new LocalRegistry(incorrectServiceId);
        }
        catch (e) {
        }
        finally {
            expect(registry).to.be.undefined;
        }
    });
    it('should be created with a correct (uuid v.4) serviceId', () => {
        const correctServiceId = uuid();
        registry = new LocalRegistry(correctServiceId);
        expect(registry).to.exist;
    });
});
describe('Existing Registry', () => {
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
        let val = null;
        const cb = (action, ent) => {
            val = ent;
        };
        entitlement1.on(entitlement1.id, cb);
        entitlement1.onStateChanged(ENTITLEMENT.COMPILE.OK, own1);
        entitlement1.onStateChanged(ENTITLEMENT.VALIDATE.OK);
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
    it('should correctly set entitlements state', () => {
        entitlement2.onStateChanged(ENTITLEMENT.COMPILE.OK, own2);
        entitlement2.onStateChanged(ENTITLEMENT.VALIDATE.OK);
        expect(entitlement2.is(ENTITLEMENT.IS.COMPILED | ENTITLEMENT.IS.VALID)).to.be.true;
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
    it('should correctly restore entitlement and recompile dependants', () => {
        let val = null;
        const cb = (ent) => {
            val = ent;
        };
        let val2 = null;
        const restore = (ent) => {
            val2 = ent;
        };
        registry.on(ENTITLEMENT.ADD.OK, cb);
        registry.on(COMPILER.MAKE.NOW, restore);
        registry.addEntitlement(entitlement1);
        entitlement1.onStateChanged(ENTITLEMENT.COMPILE.OK, own1);
        entitlement1.onStateChanged(ENTITLEMENT.VALIDATE.OK);
        expect(entitlement1.is(ENTITLEMENT.IS.ACTIVE | ENTITLEMENT.IS.COMPILED | ENTITLEMENT.IS.VALID)).to.be.true;
        expect(val).to.equal(entitlement1);
        expect(val2).to.equal(entitlement2);
    });
});
