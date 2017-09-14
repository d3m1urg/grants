import { expect } from 'chai';
import * as uuid from 'uuid/v4';

import { RegularEntitlement } from '../../../src/common/engine/entitlement';
import { LocalRegistry } from '../../../src/common/engine/registry';

let registry: LocalRegistry;

describe('Create new Registry', () => {
    it('should not create a new Registry with incorrect serviceId', () => {
        try {
            const incorrectServiceId = '123';
            registry = new LocalRegistry(incorrectServiceId);
        } catch (e) {
        }
        finally {
            expect(registry).to.be.undefined;
        }
    });
    it('should create a new Registry with correct (uuid v.4) serviceId', () => {
        const correctServiceId = uuid();
        registry = new LocalRegistry(correctServiceId);
        expect(registry).to.exist;
    });
});
