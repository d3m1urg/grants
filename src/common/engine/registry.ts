import { EventEmitter } from 'eventemitter3';
import * as uuid4 from 'uuid/v4';
import * as uuid5 from 'uuid/v5';
import { VError } from 'verror';

import { RegularEntitlement } from './entitlement';
import { Entitlement, Registry } from './models';

import { ENTITLEMENT } from './constants';

class LocalRegistry extends EventEmitter implements Registry {

    public serviceId: string;
    private registry: Map<string, Entitlement>;
    private dependencies: Map<string, Set<Entitlement>>;

    constructor(serviceId: string) {
        super();
        this.serviceId = serviceId;
        this.registry = new Map<string, Entitlement>();
        this.dependencies = new Map<string, Set<Entitlement>>();
    }

    private hasEntitlement(id: string): boolean {
        return this.registry.has(id);
    }

    private listEntitlements(ids: string[]): Entitlement[] {
        return ids.map((id: string) => this.registry.get(id));
    }

    private canCompile(entitlement: Entitlement): boolean {
        return entitlement.dependencies.every((dependencyId: string) => {
            const dependency = this.registry.get(dependencyId);
            if (!dependency) {
                return false;
            }
            return dependency.isDependable();
        });
    }

    private updateDependatsSet(id: string, entitlement: Entitlement): void {
        const dependants = this.dependencies.get(id);
        if (dependants) {
            dependants.add(entitlement);
        } else {
            this.dependencies.set(id, new Set<Entitlement>([entitlement]));
        }
    }

    private registerEventListeners(source: Entitlement, target: Entitlement): void {
        const sourceEmitter = source as RegularEntitlement;
        sourceEmitter.on(ENTITLEMENT.VALIDATE.OK, target.onDependencyChanged);
    }

    private updateDependencies(entitlement: Entitlement): void {
        for (const id of entitlement.dependencies) {
            this.updateDependatsSet(id, entitlement);
            const ancestor = this.registry.get(id);
            if (ancestor) {
                this.registerEventListeners(ancestor, entitlement);
            }
        }
    }

    public addEntitlement = (entitlement: Entitlement): void => {
        if (this.hasEntitlement(entitlement.id)) {
            this.emit(ENTITLEMENT.ADD.ERROR, new VError('Entitlement ["%s"] is already added', entitlement.id));
            return;
        }
        this.updateDependencies(entitlement);
        if (this.canCompile(entitlement)) {
            const dependencies = this.listEntitlements(entitlement.dependencies);
            this.emit(ENTITLEMENT.COMPILE.NOW, entitlement, dependencies);
        }
    }

    public generateEntitlementId = (): string => {
        let newEntitlementId;
        do {
            const intermediateId = uuid4();
            newEntitlementId = uuid5(intermediateId, this.serviceId);
        } while (this.hasEntitlement(newEntitlementId));
        return newEntitlementId;
    }

    /**
     * rawProfile has the following shape:
     * {
     *    name: 'string',
     *    entitlements: {},
     *    dependencies: [], -> dependencies must be sorted ascendingly according to priorities
     *    metadata: {}
     * }
     * @param  {[type]}
     * @return {[type]}
     */
    registerProfile(rawProfile) {
        const [canCompile, dependenciesMap] = this.canBeCompiled(rawProfile);
        const profileData = Object.assign({}, rawProfile,
            {
                dependencies: dependenciesMap,
                state: INVALID,
                entitlements: {},
                raw: rawProfile,
            });
        const profile = new Profile(profileData);
        this.enableListeners(rawProfile, profile);
        this.registry.set(profile.name, profile);
        if (canCompile) {
            this.emit(PROCESS, rawProfile);
        }
    }

    enableListeners(rawProfile, profile) {
        const listeners = Array.isArray(rawProfile.dependencies) ?
            [...rawProfile.dependencies, profile.name] :
            [profile.name];
        listeners.forEach((name) => {
            this.on(name, profile.stateChanged);
        });
        profile.on(COMPILE, (name) => {
            this.emit(PROCESS, this.registry.get(name).raw);
        });
        profile.on(INVALIDATE, (name) => {
            this.emit(name, name, INVALID);
            this.emit(INVALIDATE, name);
        });
    }

    /**
     * Takes raw profile as input data.
     * @param  {[type]}
     * @return {[type]}
     */
    canBeCompiled(rawProfile) {
        const dependenciesMap = new Map();
        if (!rawProfile.dependencies || rawProfile.dependencies.length === 0) {
            return [true, dependenciesMap];
        }
        let canCompile = true;
        rawProfile.dependencies.forEach((depName) => {
            let depState = INVALID;
            if (this.registry.has(depName)) {
                depState = this.registry.get(depName).state;
                if (depState === INVALID) {
                    canCompile = false;
                }
            } else {
                canCompile = false;
            }
            dependenciesMap.set(depName, depState);
        });
        return [canCompile, dependenciesMap];
    }

    updateProfile(rawProfile) {
        this.deleteProfile(rawProfile.name);
        this.registerProfile(rawProfile);
    }

    deleteProfile(name) {
        this.emit(name, name, INVALID);
        const profile = this.registry.get(name);
        const rawProfile = profile.raw;
        const listeners = Array.isArray(rawProfile.dependencies) ?
            [...rawProfile.dependencies, profile.name] :
            [profile.name];
        listeners.forEach((lname) => {
            this.removeListener(lname, profile.stateChanged);
        });
        profile.removeAllListeners(COMPILE);
        this.registry.delete(name);
    }

    hasProfile(name) {
        return this.registry.has(name);
    }

}

export default Registry;
