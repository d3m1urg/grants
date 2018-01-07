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
    is(stateMask: number): boolean;
    isCompilable(): boolean;
    onStateChanged(actionType: string, payload?: any): void;
    onDependencyChanged(actionType: string, dependency: Entitlement): void;
}

export interface EntitlementUpdate {
    id: string;
    own?: any;
    dependencies?: string[];
    metadata?: EntitlementMetadata;
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
    deleteEntitlement(entitlementId: string): void;
    updateEntitlement(entitlement: Entitlement): void;
}

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

export interface Message {
    type: string;
    data: any[];
}
