import { EventEmitter } from 'events';
import { v5 as isUUIDv5 } from 'is-uuid';

import {
    Entitlement,
    EntitlementMetadata,
    EntitlementUpdate,
} from './models';

import { ENTITLEMENT } from './constants';

const {
    IS: {
        ACTIVE,
        COMPILED,
        VALID,
        IMPLICIT,
        SEALED,
        PINNED,
    },
} = ENTITLEMENT;

export class RegularEntitlement extends EventEmitter implements Entitlement {

    public id: string;
    public own: any = null;
    public compiled: any;
    public state: number;
    public dependencies: string[];
    public metadata?: EntitlementMetadata;

    private dependenciesState: Map<string, boolean>;

    /**
     * Number of allowed listeners is increased to a maximum limit (Number.MAX_SAFE_INTEGER) in order to
     * suppress unwanted warnings.
     * @param id 
     * @param own 
     * @param dependencies 
     * @param state 
     * @param metadata 
     */
    constructor(id: string, own: any, dependencies: string[], state = 0, metadata?: EntitlementMetadata) {
        super();
        if (!isUUIDv5(id)) {
            throw new Error(`Entitlement id must be a valid UUID v.5 according to RFC4122, got ${id} instead.`);
        }
        this.setMaxListeners(Number.MAX_SAFE_INTEGER);
        Object.assign(this, {
            id,
            own,
            state,
            dependencies,
            metadata,
        });
        this.initDependenciesState();
    }

    private initDependenciesState(): void {
        const dependenciesTuples = this.dependencies.map((id: string): [string, boolean] => [id, false]);
        this.dependenciesState = new Map<string, boolean>(dependenciesTuples);
    }

    private onCompiled(compiled: any): void {
        this.compiled = compiled;
        this.state |= COMPILED;
        this.emit(ENTITLEMENT.VALIDATE.NOW, this);
    }

    private onValidated(): void {
        this.state |= VALID;
        this.emit(this.id, ENTITLEMENT.VALIDATE.OK, this);
        if (!this.is(IMPLICIT)) {
            this.emit(ENTITLEMENT.ANNOUNCE.NOW, this);
        }
    }

    private onUpdate(): void {
        this.state &= ~(COMPILED | VALID);
        this.emit(this.id, ENTITLEMENT.STATE.INVALID, this);
        if (this.isCompilable()) {
            this.emit(ENTITLEMENT.COMPILE.NOW, this);
        }
    }

    private onDelete(): void {
        this.state &= ~(COMPILED | VALID);
        this.emit(this.id, ENTITLEMENT.STATE.INVALID, this);
    }

    private onCustomize(mask: number): void {
        const oldState = this.state;
        this.state = mask | (this.state & (COMPILED | VALID));
        if (Boolean(oldState & ACTIVE) && !Boolean(this.state & ACTIVE)) {
            this.emit(this.id, ENTITLEMENT.STATE.INVALID, this);
        }
    }

    private onAdded(): void {
        this.state |= ACTIVE;
        if (this.isCompilable()) {
            this.emit(ENTITLEMENT.COMPILE.NOW, this);
        }
    }

    private onDependencyInvalidated(dep: Entitlement): void {
        const wasDependable = this.is(ACTIVE | VALID);
        this.dependenciesState.set(dep.id, false);
        if (wasDependable) {
            this.state &= ~(COMPILED | VALID);
            this.emit(this.id, ENTITLEMENT.STATE.INVALID, this);
            this.emit(ENTITLEMENT.STATE.INVALID, this);
        }
    }

    private onDependencyValidated(dep: Entitlement): void {
        this.dependenciesState.set(dep.id, true);
        if (this.isCompilable()) {
            this.emit(ENTITLEMENT.COMPILE.NOW, this);
        }
    }

    public setDependenciesState = (dependenciesTuples: Array<[string, boolean]>): void => {
        this.dependenciesState = new Map<string, boolean>(dependenciesTuples);
    }

    public is = (stateMask: number): boolean => {
        return Boolean(this.state & stateMask);
    }

    public isCompilable = (): boolean => {
        return [...this.dependenciesState.values()].every((item: boolean) => item);
    }

    public onStateChanged = (actionType: string, payload?: any): void => {
        if (payload === this) {
            return;
        }
        switch (actionType) {
            case ENTITLEMENT.ADD.OK: {
                this.onAdded();
                break;
            }
            case ENTITLEMENT.COMPILE.OK: {
                this.onCompiled(payload);
                break;
            }
            case ENTITLEMENT.VALIDATE.OK: {
                this.onValidated();
                break;
            }
            case ENTITLEMENT.DELETE.OK: {
                this.onDelete();
                break;
            }
            case ENTITLEMENT.UPDATE.OK: {
                this.onUpdate();
                break;
            }
            case ENTITLEMENT.CUSTOMIZE.OK: {
                this.onCustomize(payload);
                break;
            }
        }
    }

    public onDependencyChanged = (actionType: string, dependency: Entitlement): void => {
        switch (actionType) {
            case ENTITLEMENT.DELETE.OK:
            case ENTITLEMENT.UPDATE.OK:
            case ENTITLEMENT.STATE.INVALID: {
                this.onDependencyInvalidated(dependency);
                break;
            }
            case ENTITLEMENT.VALIDATE.OK: {
                this.onDependencyValidated(dependency);
                break;
            }
        }
    }
}
