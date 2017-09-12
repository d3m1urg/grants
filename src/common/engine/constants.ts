export const ENTITLEMENT = {
    ADD: {
        NOW: '[Entitlement] Add Now',
        OK: '[Entitlement] Add Ok',
        ERROR: '[Entitlement] Add Error',
    },
    COMPILE: {
        NOW: '[Entitlement] Compile Now',
        OK: '[Entitlement] Compile Ok',
        ERROR: '[Entitlement] Compile Error',
    },
    VALIDATE: {
        NOW: '[Entitlement] Validate Now',
        OK: '[Entitlement] Validate Ok',
        ERROR: '[Entitlement] Validate Error',
    },
    ANNOUNCE: {
        NOW: '[Entitlement] Announce Now',
        OK: '[Entitlement] Announce Ok',
        ERROR: '[Entitlement] Announce Error',
    },
    UPDATE: {
        NOW: '[Entitlement] Update Now',
        OK: '[Entitlement] Update Ok',
        ERROR: '[Entitlement] Update Error',
    },
    DELETE: {
        NOW: '[Entitlement] Delete Now',
        OK: '[Entitlement] Delete Ok',
        ERROR: '[Entitlement] Delete Error',
    },
    CUSTOMIZE: {
        NOW: '[Entitlement] Customize Now',
        OK: '[Entitlement] Customize Ok',
        ERROR: '[Entitlement] Customize Error',
    },
    IS: {
        ACTIVE: 1, // can be inactivated -> set via 'CUSTOMIZE'
        COMPILED: 1 << 1,
        VALID: 1 << 2,
        ANNOUNCED: 1 << 3,
        WRITABLE: 1 << 4, // can be updated -> set via 'CUSTOMIZE'
        REMOVABLE: 1 << 5, // can be deleted -> set via 'CUSTOMIZE'
    },
};

export const COMPILER = {
    MAKE: {
        NOW: '[Compiler] Make Now',
        OK: '[Compiler] Make Ok',
        ERROR: '[Compiler] Make Error',
    },
};

export const COMPLIANCE = {
     VERIFY: {
        NOW: '[Compliance] Verify Now',
        OK: '[Compliance] Verify Ok',
        ERROR: '[Compliance] Verify Error',
     },
};
