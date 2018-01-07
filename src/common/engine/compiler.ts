import {
    fromJS,
    Map as ImmutableMap,
} from 'immutable';

import { CompilationFailedAction, CompiledAction, CompilerActions } from './actions';
import { COMPILER, ENTITLEMENT } from './constants';
import { ActionEventEmitter } from './eventemitter';
import { Action, Entitlement } from './models';

const {
    ACTION: {
        COMPILE,
    },
} = ENTITLEMENT;

const {
    ACTION: {
        CLEAR_CACHE,
        DELETE_CACHED,
    },
} = COMPILER;

/**
 * Merges input raw entitlements with existing compiled ones producing compiled entitlements objects.
 * Caches resulting immutable map object for reuse.
 */
export class CachingCompiler extends ActionEventEmitter<CompilerActions> {

    private cache: ImmutableMap<string, any>;
    private eventBus: ActionEventEmitter<CompilerActions>;

    constructor(eventBus: ActionEventEmitter<CompilerActions>) {
        super();
        this.cache = ImmutableMap({});
        this.eventBus = eventBus;
        this.initListeners();
    }

    initListeners() {
        this.eventBus.on(COMPILE, this.onCompile, this);
        this.eventBus.on(CLEAR_CACHE, this.onClearCache, this);
        this.eventBus.on(DELETE_CACHED, this.onDeleteCached, this);
    }

    onCompile(entitlement: Entitlement): boolean {
        const { id, dependencies } = entitlement;
        const [dependenciesOk, cachedDependencies] = this.getCachedDependencies(dependencies);
        if (!dependenciesOk) {
            return this.emitAction(new CompilationFailedAction(id, cachedDependencies as string[]));
        }
        const compiledEntitlement = this.process(entitlement, cachedDependencies as Array<ImmutableMap<string, any>>);
        return this.emitAction(new CompiledAction(id, compiledEntitlement));
    }

    onDeleteCached(ids: string[]): void {
        this.deleteCached(ids);
    }

    onClearCache(): void {
        this.clearCache();
    }

    /**
     * Compiles entitlement by merging in natural order all dependencies and completion object, then caches the
     * resulting immutable map for further use.
     * Conflicts are resolved in favor of more significant schema in the chain with one exclusion: if more significant
     * property is explicitly set as undefined then less significant property prevails.
     * Assumes that:
     * - there's at least one dependency (the root schema default value) and completion object (might be
     * empty);
     * - all dependencies already exist in the cache - i.e. they were processed before the derived profile.
     * Caches compiled entitlements object.
     * @param { Entitlement } entitlement the entitlement object to process
     * @returns { object } compiled entitlements object
     */
    process(entitlement: Entitlement, dependencies: Array<ImmutableMap<string, any>>): any {
        const { completion } = entitlement;
        const mergeList: Array<ImmutableMap<string, any>> = [
            ...dependencies,
            fromJS(completion),
        ];
        const selectOnConflict = (older, newer) => newer === undefined ? older : newer;
        const result = mergeList.reduce(
            (prev, next) => prev.mergeDeepWith(selectOnConflict, next),
        );
        this.cache = this.cache.set(entitlement.id, result);
        return result.toJS();
    }

    getCachedDependencies(dependencies: string[]): [boolean, Array<ImmutableMap<string, any>> | string[]] {
        const cached = [];
        const missing = [];
        for (const dependencyName of dependencies) {
            const cachedDependency = this.cache.get(dependencyName);
            if (!cachedDependency) {
                missing.push(dependencyName);
                continue;
            }
            cached.push(cachedDependency);
        }
        if (missing.length > 0) {
            return [false, missing];
        }
        return [true, cached];
    }

    deleteCached(ids: string[]): void {
        this.cache = this.cache.deleteAll(ids);
    }

    clearCache(): void {
        this.cache = this.cache.clear();
    }

}
