export interface Profile {
    id: string;
    name: string;
    state: string;
    entitlements: Map<string, any>;
}

export interface Entitlement {
    id: string;
    own: any;
    compiled: any;
    state: number;
    dependencies: string[];
    metadata?: EntitlementMetadata;
    isDependable(): boolean;
    onCustomize(mask: number): void;
    onCompiled(permissions: any): void;
    onValidated(): void;
    
}

export interface EntitlementMetadata {
    serviceId: string;
    schemaRevision: string;
    tags?: string[];
}

export interface Registry {
    serviceId: string;
    generateEntitlementId(): void;
    addEntitlement(entitlement: Entitlement): void;
}
