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
    setDependenciesState(dependencies: Array<[string, boolean]>): void;
    isDependable(): boolean;
    isCompilable(): boolean;
    onCustomize(mask: number): void;
    onCompiled(compiled: any): void;
    onValidated(): void;
    onStateChanged(actionType: string): void;
    onDependencyChanged(actionType: string, dependency: Entitlement): void;
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
