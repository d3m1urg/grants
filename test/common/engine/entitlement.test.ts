/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import * as uuid4 from 'uuid/v4';
import * as uuid5 from 'uuid/v5';

import { RegularEntitlement } from '../../../src/common/engine/entitlement';

let entitlement1: RegularEntitlement;

describe('Create new Entitlement', () => {
    it('should not create a new Entitlement with incorrect id', () => {
        try {
            const incorrectId = '456';
            entitlement1 = new RegularEntitlement(incorrectId, {}, [], 0);
        } catch (e) {
        } finally {
            expect(entitlement1).to.be.undefined;
        }
    });
    it('should create a new Entitlement for correct id (uuid v5)', () => {
        const entitlementId = uuid5(uuid4(), uuid4());
        entitlement1 = new RegularEntitlement(entitlementId, {}, []);
        expect(entitlement1).to.exist;
    });
});
