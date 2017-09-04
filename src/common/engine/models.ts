export interface Profile {
    name: string;
    state: string;
    entitlements: Map<string, any>;
    dependencies: Set<Profile>;
    derivatives: Set<Profile>;
}

export interface ProfileNode extends Profile {

}

export interface Event {
    type: string;
    root: ProfileNode;
}

export interface Entitlement {
    id: string;
    compiled: any;
    raw: any;
    state: string;
    ancestors: Entitlement[];
    metadata?: EntitlementMetadata;
}

export interface EntitlementMetadata {
    serviceId: string;
    schemaRevision: string;
    tags?: string[];
}
