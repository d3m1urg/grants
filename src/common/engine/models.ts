/**
 * Action interface describes generic change.
 * When 'id' field is not provided while 'type' is (it always exists by design) type is used to emit appropriate event.
 * If 'id' is present it's used in place of the type as an event name to narrow the number of called listeners.
 */
export interface Action {
    type: string;
    payload?: any;
    id?: string;
}

/**
 * serviceId        uuid v4
 * schemaId         uuid v5 derived from serviceId
 * schemaRevision   a semver-compatible revision
 * tags             immutable set of arbitrary tags assigned to categorize entitlements
 */
export interface EntitlementMetadata {
    serviceId: string;
    schemaId: string;
    schemaRevision: string;
    tags?: string[];
};

/**
 * id               uuid v5
 * completion       arbitrary shaped object used to correct final entitlements objects
 * dependencies     array of entitlements ids which an entitlement object is derived from
 * metadata         (see above)
 */
export interface Entitlement {
    id: string;
    completion: any;
    dependencies: string[];
    metadata?: EntitlementMetadata;
}

/**
 * state            a bitmask representing current entitlements object state (e.g. ACTIVE, COMPILED, VALID etc.)
 * compiled         object containing merged entitlements data
 */
export interface CompiledEntitlement extends Entitlement {
    state: number;
    compiled: any;
};

/**
 * tags             immutable set of arbitrary tags assigned to categorize profiles
 */
export interface ProfileMetadata {
    tags?: string[];
};

/**
 * id               uuid v5 derived from serviceId
 * state            a bitmask representing current profile state (e.g. ACTIVE, SEALED, PINNED etc.)
 * entitlements     immutable map of entitlements objects
 * metadata         (see above)
 */
export interface Profile {
    id: string;
    state: number;
    entitlements: Map<string, Entitlement>;
    metadata?: ProfileMetadata;
};

export interface RuleArg {
    type: string;
    required: boolean;
    label: string;
}

export interface Rule {
    name: string;
    label: string;
    description: string;
    args: RuleArg[];
    fn: (...args: any[]) => boolean;
    errorText: string;
}

export interface RulesModule {
    rules: Rule[];
    module: string;
}
