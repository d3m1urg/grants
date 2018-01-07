export const RESULT = {
    OK:     'Result.Ok',
    ERROR:  'Result.Error',
};

export const ENTITLEMENT = {
    ACTION: {
        ADD:        'Entitlement.Add',
        COMPILE:    'Entitlement.Compile',
        VALIDATE:   'Entitlement.Validate',
        ANNOUNCE:   'Entitlement.Announce',
        UPDATE:     'Entitlement.Update',
        DENOUNCE:   'Entitlement.Denounce',
        INVALIDATE: 'Entitlement.Invalidate',
        DELETE:     'Entitlement.Delete',
        CUSTOMIZE:  'Entitlement.Customize',
    },
    STATE: {
        ACTIVE:     1,
        COMPILED:   1 << 1,
        VALID:      1 << 2,
        ANNOUNCED:  1 << 3,
        IMPLICIT:   1 << 4,
        SEALED:     1 << 5,
        PINNED:     1 << 6,
    },
};

export const COMPILER = {
    ACTION: {
        COMPILED:           'Compiler.Compiled',
        COMPILATION_FAILED: 'Compiler.Compilation_Failed', // 1 reason - due to missing dependency
        CLEAR_CACHE:        'Compiler.Clear_Cache',
        DELETE_CACHED:      'Compiler.Delete_Cached',
    },
};

export const COMPLIANCE = {
    ACTION: {
        VALID:              'Compliance.Valid',
        VALIDATION_FAILED:  'Compliance.Validation_Failed',
    },
};

export const PROFILE = {
    STATE: {
        ACTIVE: 1,
        SEALED: 1 << 1,
        PINNED: 1 << 2,
    },
};

export const DIRECTORY = {
    ACTION: {
        PUBLISH:    'Directory.Publish',
        REVOKE:     'Directory.Revoke',
    },
};
