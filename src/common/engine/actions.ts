import { COMPILER, COMPLIANCE, ENTITLEMENT } from './constants';
import { Action, CompiledEntitlement, Entitlement } from './models';

const {
    ACTION: {
        COMPILED,
        COMPILATION_FAILED,
        CLEAR_CACHE,
        DELETE_CACHED,
    },
} = COMPILER;

const {
    ACTION: {
        VALID,
        INVALID,
    },
} = COMPLIANCE;

const {
    ACTION: {
        ADD,
        COMPILE,
        VALIDATE,
        ANNOUNCE,
        UPDATE,
        DENOUNCE,
        INVALIDATE,
        DELETE,
        CUSTOMIZE,
    },
} = ENTITLEMENT;

// Entitlement actions

export class CompileAction implements Action {
    readonly type = COMPILE;
    constructor(public payload: Entitlement) {}
}

export class ValidateAction implements Action {
    readonly type = VALIDATE;
    constructor(public payload: CompiledEntitlement) {}
}

// Compliance actions

export class ValidAction implements Action {
    readonly type = VALID;
    constructor(public id: string) {}
}

export class InvalidAction implements Action {
    readonly type = INVALID;
    constructor(public id: string) {}
}

// Compiler Actions

export class CompiledAction implements Action {
    readonly type = COMPILED;
    constructor(public id: string, public payload: any) {}
}

export class CompilationFailedAction implements Action {
    readonly type = COMPILATION_FAILED;
    constructor(public id: string, public payload: string[]) {};
}

export class ClearCacheAction implements Action {
    readonly type = CLEAR_CACHE;
}

export class DeleteCachedAction implements Action {
    readonly type = DELETE_CACHED;
    constructor(public payload: string[]) {}
}

// Export Types

export type EntitlementActions =    CompileAction |
                                    ValidateAction |
                                    ValidAction |
                                    CompiledAction |
                                    CompilationFailedAction;

export type CompilerActions =   CompileAction |
                                CompiledAction |
                                CompilationFailedAction |
                                DeleteCachedAction |
                                ClearCacheAction;

export type ComplianceInputActions = ValidateAction;

export type ComplianceOutputActions =   ValidAction |
                                        InvalidAction;
