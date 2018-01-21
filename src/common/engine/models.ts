/**
 * Action interface describes generic change.
 * When 'id' field is not provided while 'type' is (it always exists by design) type is used to emit appropriate event.
 * If 'id' is present it's used in place of the type as an event name to narrow the number of called listeners.
 */
export interface Action {
    type: string;
    id?: string;
    payload?: any;
}

/**
 * @interface Service
 * @property { string } id         Unique auto-generated service UUID v4.
 * @property { string } name       User-defined service name for display / search purposes.
 * @property { string } uri        Service URI.
 * @property { object } [metadata] Optional. Arbitrary service metadata.
 */
export interface Service {
    id: string;
    name: string;
    uri: string;
    metadata?: any;
}

/**
 * @interface Schema
 * @property { string }   id       Unique auto-generated schema UUID v5 derived from service id (see above).
 * @property { string }   name     User-defined name of the schema (e.g. 'Manager', 'Senior accountant', etc.).
 * @property { string }   revision A semver-compatible revision string.
 * @property { object }   defaults Object containing all default values for keys (where specified).
 * @property { Service }  service  Service that published the schema.
 * @property { string[] } [tags]   Optional. Array of arbitrary tags assigned to categorize entitlements.
 */
export interface Schema {
    id: string;
    name: string;
    revision: string;
    defaults: any;
    service: Service;
    tags?: string[];
};

/**
 * @interface Entitlement
 * @property { string }   id           Unique auto-generated entitlement UUID v5 derived from schema id (see above).
 * @property { object }   completion   Arbitrary shaped object for correction of final entitlements objects.
 * @property { string[] } dependencies Array of entitlements ids which an entitlement object is derived from.
 * @property { Schema }   schema       Parent schema for this entitlement object.
 */
export interface Entitlement {
    id: string;
    completion: any;
    dependencies: string[];
    schema: Schema;
}

/**
 * @interface CompiledEntitlement
 * @property { number } state    a bitmask representing current entitlements object state (e.g. ACTIVE, COMPILED etc.).
 * @property { object } compiled object containing merged entitlements data.
 */
export interface CompiledEntitlement extends Entitlement {
    state: number;
    compiled: any;
};

/**
 * @interface ProfileMetadata
 * @property { string }   [externalId] Optional. External user identifier (e.g. 'domain/username' or 'name@domain.com').
 * @property { string }   [uri]        Optional. Arbitrary URI for an external system containing profile subject info.
 * @property { string[] } [tags]       Optional. Array of arbitrary tags assigned to categorize entitlements.
 */
export interface ProfileMetadata {
    externalId?: string;
    uri?: string;
    tags?: string[];
};

/**
 * @interface Profile
 * @property { string }          id           Unique auto-generated profile UUID v4.
 * @property { string }          name         Profile label for UI.
 * @property { number }          state        Bitmask representing current profile state (e.g. ACTIVE, SEALED etc.).
 * @property { Entitlement[] }   entitlements Set of profile entitlements.
 * @property { ProfileMetadata } metadata     Profile meta data for linking with external auth sources.
 */
export interface Profile {
    id: string;
    name: string;
    state: number;
    entitlements: Entitlement[];
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
