import { EventEmitter } from 'eventemitter3';
import * as uuid4 from 'uuid/v4';
import * as uuid5 from 'uuid/v5';
import { VError } from 'verror';

import { RegularEntitlement } from './entitlement';
import {
    Entitlement,
    EntitlementUpdate,
    Registry,
} from './models';

import {
    COMPILER,
    COMPLIANCE,
    DIRECTORY,
    ENTITLEMENT,
} from './constants';

const {
    IS: {
        ACTIVE,
        VALID,
        SEALED,
        PINNED,
    },
} = ENTITLEMENT;

export class LocalRegistry extends EventEmitter implements Registry {

    public serviceId: string;
    private registry: Map<string, Entitlement>;

    /**
     * Creates registry for a specified service id.
     * Service id must be a valid UUID v.4 according to RFC4122.
     * @param serviceId Unique service id.
     */
    constructor(serviceId: string) {
        super();
        this.serviceId = serviceId;
        this.registry = new Map<string, Entitlement>();
    }

    /**
     * Checks whether entitlement with the provided id exists in the registry.
     * @param id Entitlement unique id
     * @returns True if entitlement exists in the registry, false otherwise.
     */
    private hasEntitlement(id: string): boolean {
        return this.registry.has(id);
    }

    /**
     * Returns an array of tuples [id: string, dependable: boolean] indicating if an entitlement with specified id
     * can be used as a dependency in the compilation process.
     * @param ids Entitlements ids.
     * @returns Array of tuples [string, boolean]
     */
    private getEntitlementsState(ids: string[]): Array<[string, boolean]> {
        const dependable = ACTIVE | VALID
        return ids.map((id: string): [string, boolean] => {
            const entitlement = this.registry.get(id);
            const isDependable = entitlement ? entitlement.is(dependable) : false;
            return [id, isDependable];
        });
    }

    /**
     * Returns an array of entitlements whose ids match the provided ones.
     * @param ids Entitlements ids.
     * @returns Array of entitlements matching the provided ids.
     */
    private getEntitlementsByIds(ids: string[]): Entitlement[] {
        return ids.map((id: string) => this.registry.get(id));
    }

    /**
     * Requests the compiler component to process the provided entitlement.
     * @param entitlement The entitlement object to compile.
     */
    private requestCompilation = (entitlement: Entitlement): void => {
        const dependencies = this.getEntitlementsByIds(entitlement.dependencies);
        this.emit(COMPILER.MAKE.NOW, entitlement, dependencies);
    }

    /**
     * Requests the compliance component to verify the provided entitlement.
     * @param entitlement The entitlement object to verify.
     */
    private requestValidation = (entitlement: Entitlement): void => {
        const dependencies = this.getEntitlementsByIds(entitlement.dependencies);
        this.emit(COMPLIANCE.VERIFY.NOW, entitlement);
    }

    /**
     * Requests the directory component to publish the provided entitlement.
     * @param entitlement The entitlement object to publish.
     */
    private requestAnnounce = (entitlement: Entitlement): void => {
        this.emit(DIRECTORY.PUBLISH.NOW, entitlement);
    }

    /**
     * Registers event listeners using global hooks (constants) and entitlements ids as event names.
     * Currently 3 types of listeners are registered:
     * - registry starts listening for entitlement events (ENTITLEMENT.*);
     * - entitlement starts listening the registry for state change events;
     * - entitlement start listening the registry for dependency state changes.
     * @param entitlement Entitlement which is being processed.
     */
    private registerListeners(entitlement: Entitlement): void {
        const emitter = entitlement as RegularEntitlement;
        emitter.on(ENTITLEMENT.COMPILE.NOW, this.requestCompilation);
        emitter.on(ENTITLEMENT.VALIDATE.NOW, this.requestValidation);
        emitter.on(ENTITLEMENT.ANNOUNCE.NOW, this.requestAnnounce);
        this.on(entitlement.id, entitlement.onStateChanged);
        for (const id of entitlement.dependencies) {
            this.on(id, entitlement.onDependencyChanged);
        }
    }

    /**
     * Propagates updated dependencies state to the entitlements object.
     * @param entitlement Entitlements object to update.
     */
    private updateDependenciesState(entitlement: Entitlement, newDependencies: string[]): void {
        const dependenciesState = this.getEntitlementsState(newDependencies);
        entitlement.setDependenciesState(dependenciesState);
    }

    private removeListeners(entitlement: Entitlement): void {
        const emitter = entitlement as RegularEntitlement;
        emitter.removeListener(ENTITLEMENT.COMPILE.NOW, this.requestCompilation);
        emitter.removeListener(ENTITLEMENT.VALIDATE.NOW, this.requestValidation);
        emitter.removeListener(ENTITLEMENT.ANNOUNCE.NOW, this.requestAnnounce);
        this.removeListener(entitlement.id, entitlement.onStateChanged);
        for (const id of entitlement.dependencies) {
            this.removeListener(id, entitlement.onDependencyChanged);
        }
    }

    /**
     * Adds the entitlement to the registry. If another entitlement with the same id is already
     * present in the registry then new registry is not added and an error message is emitted.
     * If no entitlement with the same id is present then entitlement is added to the registry,
     * appropriate listeners are registered and events emitted.
     * Ancestor and derived entitlements are linked together via emitting events with entitlement
     * id used as event name.
     */
    public addEntitlement = (entitlement: Entitlement): void => {
        if (this.hasEntitlement(entitlement.id)) {
            this.emit(ENTITLEMENT.ADD.ERROR, new VError('Entitlement ["%s"] is already added', entitlement.id));
            return;
        }
        this.registry.set(entitlement.id, entitlement);
        this.registerListeners(entitlement);
        this.updateDependenciesState(entitlement, entitlement.dependencies);
        this.emit(ENTITLEMENT.ADD.OK, entitlement);
        this.emit(entitlement.id, ENTITLEMENT.ADD.OK, entitlement);
    }

    public deleteEntitlement = (entitlementId: string): void => {
        if (!this.hasEntitlement(entitlementId)) {
            this.emit(ENTITLEMENT.DELETE.ERROR, new VError('Entitlement ["%s"] is not registered', entitlementId));
            return;
        }
        const entitlement = this.registry.get(entitlementId);
        if (entitlement.is(PINNED)) {
            this.emit(ENTITLEMENT.DELETE.ERROR,
                new VError('Entitlement ["%s"] is pinned and can not be deleted', entitlementId));
            return;
        }
        this.registry.delete(entitlementId);
        this.emit(ENTITLEMENT.DELETE.OK, entitlementId);
        this.emit(entitlementId, ENTITLEMENT.DELETE.OK);
        this.removeListeners(entitlement);
    }

    private updateDependencies(entitlement: Entitlement, newDependencies: string[]): void {
        for (const id of entitlement.dependencies) {
            this.removeListener(id, entitlement.onDependencyChanged);
        }
        for (const id of newDependencies) {
            this.addListener(id, entitlement.onDependencyChanged);
        }
        this.updateDependenciesState(entitlement, newDependencies);
    }

    public updateEntitlement = (update: EntitlementUpdate): void => {
        if (!this.hasEntitlement(update.id)) {
            this.emit(ENTITLEMENT.UPDATE.ERROR, new VError('Entitlement ["%s"] is not registered', update.id));
            return;
        }
        const entitlement = this.registry.get(update.id);
        if (entitlement.is(SEALED)) {
            this.emit(ENTITLEMENT.UPDATE.ERROR,
                new VError('Entitlement ["%s"] is pinned and can not be updated', entitlement.id));
            return;
        }
        const {
            own,
            dependencies,
            metadata,
        } = update;
        if (dependencies) {
            this.updateDependencies(entitlement, dependencies);
        }
        if (own) {
            entitlement.own = own;
        }
        if (metadata) {
            entitlement.metadata = metadata;
        }
        this.emit(ENTITLEMENT.UPDATE.OK, entitlement.id);
        if (dependencies || own) {
            this.emit(entitlement.id, ENTITLEMENT.UPDATE.OK);
        }
    }

    /**
     * Generate unique entitlement id for the specified service taking into consideration all currently existing ids.
     * If an entitlements id collision is detected then it is regenerated.
     */
    public generateEntitlementId = (): string => {
        let newEntitlementId;
        do {
            const intermediateId = uuid4();
            newEntitlementId = uuid5(intermediateId, this.serviceId);
        } while (this.hasEntitlement(newEntitlementId));
        return newEntitlementId;
    }

}
