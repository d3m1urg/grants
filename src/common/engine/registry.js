import { EventEmitter } from 'events';
import { v4 as isUUIDv4 } from 'is-uuid';
import * as uuid4 from 'uuid/v4';
import * as uuid5 from 'uuid/v5';
import { VError } from 'verror';
import { COMPILER, COMPLIANCE, DIRECTORY, ENTITLEMENT, } from './constants';
const { IS: { ACTIVE, VALID, SEALED, PINNED, }, } = ENTITLEMENT;
export class LocalRegistry extends EventEmitter {
    /**
     * Creates registry for a specified service id.
     * Service id must be a valid UUID v.4 according to RFC4122. Otherwise constructor throws an error.
     * Number of allowed listeners is increased to a maximum limit (Number.MAX_SAFE_INTEGER) in order to
     * suppress unwanted warnings.
     * @param serviceId Unique service id.
     */
    constructor(serviceId) {
        super();
        /**
         * Requests the compiler component to process the provided entitlement.
         * @param entitlement The entitlement object to compile.
         */
        this.requestCompilation = (entitlement) => {
            const dependencies = this.getEntitlementsByIds(entitlement.dependencies);
            this.emit(COMPILER.MAKE.NOW, entitlement, dependencies);
        };
        /**
         * Requests the compliance component to verify the provided entitlement.
         * @param entitlement The entitlement object to verify.
         */
        this.requestValidation = (entitlement) => {
            const dependencies = this.getEntitlementsByIds(entitlement.dependencies);
            this.emit(COMPLIANCE.VERIFY.NOW, entitlement);
        };
        /**
         * Requests the directory component to publish the provided entitlement.
         * @param entitlement The entitlement object to publish.
         */
        this.requestAnnounce = (entitlement) => {
            this.emit(DIRECTORY.PUBLISH.NOW, entitlement);
        };
        /**
         * Forwards entitlement invalidation event to high-order listeners (e.g. Directory, Cache, Log, etc.).
         */
        this.forwardInvalid = (entitlement) => {
            this.emit(ENTITLEMENT.STATE.INVALID, entitlement);
        };
        /**
         * Forwards dependency entitlement state changes to dependent entitlements.
         */
        this.forwardStateToDependencies = (state, source) => {
            this.emit(source.id, state, source);
        };
        /**
         * Adds the entitlement to the registry. If another entitlement with the same id is already
         * present in the registry then new registry is not added and an error message is emitted.
         * If no entitlement with the same id is present then entitlement is added to the registry,
         * appropriate listeners are registered and events emitted.
         * Ancestor and derived entitlements are linked together via emitting events with entitlement
         * id used as event name.
         * @param entitlement Entitlement object to add
         */
        this.addEntitlement = (entitlement) => {
            if (this.hasEntitlement(entitlement.id)) {
                this.emit(ENTITLEMENT.ADD.ERROR, new VError('Entitlement ["%s"] is already added', entitlement.id));
                return;
            }
            this.registry.set(entitlement.id, entitlement);
            this.registerListeners(entitlement);
            this.updateDependenciesState(entitlement, entitlement.dependencies);
            this.emit(ENTITLEMENT.ADD.OK, entitlement);
            this.emit(entitlement.id, ENTITLEMENT.ADD.OK, entitlement);
        };
        /**
         * Deletes the entitlement with the provided id from the registry.
         * Emits error messages if entitlement with the provided id is not found or if the entitlement is pinned, i.e.
         * can not be deleted without prior calling customize method.
         * @param entitlementId Id of the entitlement to delete
         */
        this.deleteEntitlement = (entitlementId) => {
            if (!this.hasEntitlement(entitlementId)) {
                this.emit(ENTITLEMENT.DELETE.ERROR, new VError('Entitlement ["%s"] is not registered', entitlementId));
                return;
            }
            const entitlement = this.registry.get(entitlementId);
            if (entitlement.is(PINNED)) {
                this.emit(ENTITLEMENT.DELETE.ERROR, new VError('Entitlement ["%s"] is pinned and can not be deleted', entitlementId));
                return;
            }
            this.registry.delete(entitlementId);
            this.emit(ENTITLEMENT.DELETE.OK, entitlementId);
            this.emit(entitlementId, ENTITLEMENT.DELETE.OK, entitlement);
            this.removeListeners(entitlement);
        };
        /**
         * Updates the entitlement object with provided data which may contain new 'own' entitlement properties, new
         * dependencies and metadata. Emits errors if no entitlement with provided id is found in the registry or
         * entitlement is 'sealed', i.e. can not be updated without prior customization.
         * @param update Update data object
         */
        this.updateEntitlement = (update) => {
            if (!this.hasEntitlement(update.id)) {
                this.emit(ENTITLEMENT.UPDATE.ERROR, new VError('Entitlement ["%s"] is not registered', update.id));
                return;
            }
            const entitlement = this.registry.get(update.id);
            if (entitlement.is(SEALED)) {
                this.emit(ENTITLEMENT.UPDATE.ERROR, new VError('Entitlement ["%s"] is pinned and can not be updated', entitlement.id));
                return;
            }
            const { own, dependencies, metadata, } = update;
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
                this.emit(entitlement.id, ENTITLEMENT.UPDATE.OK, entitlement);
            }
        };
        /**
         * Generate unique entitlement id for the specified service taking into consideration all currently existing ids.
         * If an entitlements id collision is detected then it is regenerated.
         */
        this.generateEntitlementId = () => {
            let newEntitlementId;
            do {
                const intermediateId = uuid4();
                newEntitlementId = uuid5(intermediateId, this.serviceId);
            } while (this.hasEntitlement(newEntitlementId));
            return newEntitlementId;
        };
        if (!isUUIDv4(serviceId)) {
            throw new Error(`serviceId must be a valid UUID v.4 according to RFC4122, got ${serviceId} instead.`);
        }
        this.setMaxListeners(Number.MAX_SAFE_INTEGER);
        this.serviceId = serviceId;
        this.registry = new Map();
    }
    /**
     * Checks whether entitlement with the provided id exists in the registry.
     * @param id Entitlement unique id
     * @returns True if entitlement exists in the registry, false otherwise.
     */
    hasEntitlement(id) {
        return this.registry.has(id);
    }
    /**
     * Returns an array of tuples [id: string, dependable: boolean] indicating if an entitlement with specified id
     * can be used as a dependency in the compilation process.
     * @param ids Entitlements ids.
     * @returns Array of tuples [string, boolean]
     */
    getEntitlementsState(ids) {
        const dependable = ACTIVE | VALID;
        return ids.map((id) => {
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
    getEntitlementsByIds(ids) {
        return ids.map((id) => this.registry.get(id));
    }
    /**
     * Registers event listeners using global hooks (constants) and entitlements ids as event names.
     * Currently 3 types of listeners are registered:
     * - registry starts listening for entitlement events (ENTITLEMENT.*);
     * - entitlement starts listening the registry for state change events;
     * - entitlement start listening the registry for dependency state changes.
     * @param entitlement Entitlement which is being processed.
     */
    registerListeners(entitlement) {
        const emitter = entitlement;
        emitter.addListener(ENTITLEMENT.COMPILE.NOW, this.requestCompilation);
        emitter.addListener(ENTITLEMENT.VALIDATE.NOW, this.requestValidation);
        emitter.addListener(ENTITLEMENT.ANNOUNCE.NOW, this.requestAnnounce);
        emitter.addListener(ENTITLEMENT.STATE.INVALID, this.forwardInvalid);
        emitter.addListener(entitlement.id, this.forwardStateToDependencies);
        this.prependListener(entitlement.id, entitlement.onStateChanged);
        for (const id of entitlement.dependencies) {
            this.addListener(id, entitlement.onDependencyChanged);
        }
    }
    /**
     * Propagates updated dependencies state to the entitlements object.
     * @param entitlement Entitlements object to update.
     */
    updateDependenciesState(entitlement, newDependencies) {
        const dependenciesState = this.getEntitlementsState(newDependencies);
        entitlement.setDependenciesState(dependenciesState);
    }
    /**
     * Removes all listeners registered for an entitlement.
     * Note that all listeners must be correctly removed in order to prevent memory leaks.
     * @param entitlement Entitlement which is deregistered as event emitter / listener
     */
    removeListeners(entitlement) {
        const emitter = entitlement;
        emitter.removeListener(ENTITLEMENT.COMPILE.NOW, this.requestCompilation);
        emitter.removeListener(ENTITLEMENT.VALIDATE.NOW, this.requestValidation);
        emitter.removeListener(ENTITLEMENT.ANNOUNCE.NOW, this.requestAnnounce);
        emitter.removeListener(ENTITLEMENT.STATE.INVALID, this.forwardInvalid);
        emitter.removeListener(entitlement.id, this.forwardStateToDependencies);
        this.removeListener(entitlement.id, entitlement.onStateChanged);
        for (const id of entitlement.dependencies) {
            this.removeListener(id, entitlement.onDependencyChanged);
        }
    }
    /**
     * Update dependencies for the provided entitlement object.
     * Removes / adds required event listeners upon updates.
     * @param entitlement Entitlement object to update.
     * @param newDependencies Array containing list of new dependencies.
     */
    updateDependencies(entitlement, newDependencies) {
        for (const id of entitlement.dependencies) {
            this.removeListener(id, entitlement.onDependencyChanged);
        }
        for (const id of newDependencies) {
            this.addListener(id, entitlement.onDependencyChanged);
        }
        this.updateDependenciesState(entitlement, newDependencies);
    }
}
