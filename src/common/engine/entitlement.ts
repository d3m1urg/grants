import { EventEmitter } from 'eventemitter3';

import { Entitlement, EntitlementMetadata } from './models';

import { ENTITLEMENT } from './constants';

export class RegularEntitlement extends EventEmitter implements Entitlement {

    public id: string;
    public own: any = null;
    public compiled: any;
    public state = 0;
    public dependencies: string[];
    public metadata?: EntitlementMetadata;

    constructor(id: string, own: any, dependencies: string[], metadata: EntitlementMetadata) {
        super();
        Object.assign(this, {
            id,
            own,
            dependencies,
            metadata,
        });
    }

    public isDependable(): boolean {
        const isDependableMask = ENTITLEMENT.IS.ACTIVE | ENTITLEMENT.IS.VALID;
        return Boolean(this.state & isDependableMask);
    }

    public onCompiled = (compiled: any): void => {
        this.compiled = compiled;
        this.emit(ENTITLEMENT.VALIDATE.NOW, this);
    }

    public onValidated = (): void => {
        ;
    }

    public onCustomize(mask: number): void {
        ;
    }
}
