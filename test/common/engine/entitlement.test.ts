import { expect } from 'chai';
import { RegularEntitlement } from '../../../src/common/engine/entitlement';

describe('Create new Entitlement', () => {
    it('should create empty Entitlement', () => {
        const entitlement = new RegularEntitlement('1', {}, [], {
            serviceId: '2',
            schemaRevision: '1',
        });
    })
});
