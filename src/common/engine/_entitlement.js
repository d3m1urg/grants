import { EventEmitter } from 'events';
import { v5 as isUUIDv5 } from 'is-uuid';
import { ENTITLEMENT } from './constants';
const { IS: { ACTIVE, COMPILED, VALID, IMPLICIT, SEALED, PINNED, }, } = ENTITLEMENT;
export class RegularEntitlement extends EventEmitter {
    /**
     * Number of allowed listeners is increased to a maximum limit (Number.MAX_SAFE_INTEGER) in order to
     * suppress unwanted warnings.
     * @param id
     * @param own
     * @param dependencies
     * @param state
     * @param metadata
     */
    constructor(id, own, dependencies, state = 0, metadata) {
        super();
        this.own = null;
        this.setDependenciesState = (dependenciesTuples) => {
            this.dependenciesState = new Map(dependenciesTuples);
        };
        this.is = (stateMask) => {
            return Boolean(this.state & stateMask);
        };
        this.isCompilable = () => {
            return [...this.dependenciesState.values()].every((item) => item);
        };
        this.onStateChanged = (actionType, payload) => {
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
        };
        this.onDependencyChanged = (actionType, dependency) => {
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
        };
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
    initDependenciesState() {
        const dependenciesTuples = this.dependencies.map((id) => [id, false]);
        this.dependenciesState = new Map(dependenciesTuples);
    }
    onCompiled(compiled) {
        this.compiled = compiled;
        this.state |= COMPILED;
        this.emit(ENTITLEMENT.VALIDATE.NOW, this);
    }
    onValidated() {
        this.state |= VALID;
        this.emit(this.id, ENTITLEMENT.VALIDATE.OK, this);
        if (!this.is(IMPLICIT)) {
            this.emit(ENTITLEMENT.ANNOUNCE.NOW, this);
        }
    }
    onUpdate() {
        this.state &= ~(COMPILED | VALID);
        this.emit(this.id, ENTITLEMENT.STATE.INVALID, this);
        if (this.isCompilable()) {
            this.emit(ENTITLEMENT.COMPILE.NOW, this);
        }
    }
    onDelete() {
        this.state &= ~(COMPILED | VALID);
        this.emit(this.id, ENTITLEMENT.STATE.INVALID, this);
    }
    onCustomize(mask) {
        const oldState = this.state;
        this.state = mask | (this.state & (COMPILED | VALID));
        if (Boolean(oldState & ACTIVE) && !Boolean(this.state & ACTIVE)) {
            this.emit(this.id, ENTITLEMENT.STATE.INVALID, this);
        }
    }
    onAdded() {
        this.state |= ACTIVE;
        if (this.isCompilable()) {
            this.emit(ENTITLEMENT.COMPILE.NOW, this);
        }
    }
    onDependencyInvalidated(dep) {
        const wasDependable = this.is(ACTIVE | VALID);
        this.dependenciesState.set(dep.id, false);
        if (wasDependable) {
            this.state &= ~(COMPILED | VALID);
            this.emit(this.id, ENTITLEMENT.STATE.INVALID, this);
            this.emit(ENTITLEMENT.STATE.INVALID, this);
        }
    }
    onDependencyValidated(dep) {
        this.dependenciesState.set(dep.id, true);
        if (this.isCompilable()) {
            this.emit(ENTITLEMENT.COMPILE.NOW, this);
        }
    }
}
