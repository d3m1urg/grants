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

    private dependenciesState: Map<string, boolean>;

    constructor(id: string, own: any, dependencies: string[], metadata: EntitlementMetadata) {
        super();
        Object.assign(this, {
            id,
            own,
            dependencies,
            metadata,
        });
        this.initDependenciesState();
    }

    private initDependenciesState(): void {
        const dependenciesTuples = this.dependencies.map((id: string): [string, boolean] => [id, false]);
        this.dependenciesState = new Map<string, boolean>(dependenciesTuples);
    }

    public setDependenciesState(dependenciesTuples: Array<[string, boolean]>): void {
        this.dependenciesState = new Map<string, boolean>(dependenciesTuples);
        if (this.isCompilable()) {
            this.emit(ENTITLEMENT.COMPILE.NOW, this);
        }
    }

    public isDependable(): boolean {
        const isDependableMask = ENTITLEMENT.IS.ACTIVE | ENTITLEMENT.IS.VALID;
        return Boolean(this.state & isDependableMask);
    }

    public isCompilable(): boolean {
        return [...this.dependenciesState.values()].every((item: boolean) => item);
    }

    public onCompiled = (compiled: any): void => {
        this.compiled = compiled;
        this.emit(ENTITLEMENT.VALIDATE.NOW, this);
    }

    public onValidated = (): void => {
        this.state |= ENTITLEMENT.IS.VALID;
        this.emit(this.id, ENTITLEMENT.IS.VALID);
    }

    public onCustomize(mask: number): void {
        ;
    }

    onStateChanged = (actionType: string): void => {
        ;
    }

    onDependencyChanged = (actionType: string, dependency: Entitlement): void => {
        ;
    }
}
