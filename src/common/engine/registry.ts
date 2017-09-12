import { EventEmitter } from 'eventemitter3';
import * as uuid4 from 'uuid/v4';
import * as uuid5 from 'uuid/v5';
import { VError } from 'verror';

import { RegularEntitlement } from './entitlement';
import { Entitlement, Registry } from './models';

import { COMPILER, COMPLIANCE, ENTITLEMENT } from './constants';

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
        return ids.map((id: string): [string, boolean] => {
            const entitlement = this.registry.get(id);
            const isDependable = entitlement ? entitlement.isDependable() : false;
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
     * Request the compiler component to process the provided entitlement.
     * @param ent The entitlement object to compile.
     */
    private requestCompilation = (ent: Entitlement): void => {
        const dependencies = this.getEntitlementsByIds(ent.dependencies);
        this.emit(COMPILER.MAKE.NOW, ent, dependencies);
    }

    private requestValidation = (ent: Entitlement): void => {
        const dependencies = this.getEntitlementsByIds(ent.dependencies);
        this.emit(COMPLIANCE.VERIFY.NOW, ent);
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
        this.on(entitlement.id, entitlement.onStateChanged);
        for (const id of entitlement.dependencies) {
            this.on(id, entitlement.onDependencyChanged);
        }
    }

    /**
     * Propagates updated dependencies state to the entitlements object.
     * @param entitlement Entitlements object to update.
     */
    private updateDependenciesState(entitlement: Entitlement): void {
        const dependenciesState = this.getEntitlementsState(entitlement.dependencies);
        entitlement.setDependenciesState(dependenciesState);
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
        this.updateDependenciesState(entitlement);
        this.emit(ENTITLEMENT.ADD.OK, entitlement);
        this.emit(entitlement.id, ENTITLEMENT.ADD.OK, entitlement);
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
