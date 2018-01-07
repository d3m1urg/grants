export const RESULT = {
    OK:             1,
    ERROR:          1 << 1,
};

export const ENTITLEMENT = {
    PREFIX: 'ENTITLEMENT',
    ACTION: {
        ADD:        1 << 2,
        COMPILE:    1 << 3,
        VALIDATE:   1 << 4,
        ANNOUNCE:   1 << 5,
        UPDATE:     1 << 6, // update changes entitlement content
        INVALIDATE: 1 << 7,
        DELETE:     1 << 8,
        CUSTOMIZE:  1 << 9, // customize changes metadata (see below)
    },
    STATE: {
        ACTIVE:     1,      // can be inactivated -> set via 'CUSTOMIZE'
        COMPILED:   1 << 1,
        VALID:      1 << 2,
        IMPLICIT:   1 << 3, // can not be published -> set via 'CUSTOMIZE'
        SEALED:     1 << 4, // can not be updated -> set via 'CUSTOMIZE'
        PINNED:     1 << 5, // can not be deleted -> set via 'CUSTOMIZE'
    },
};

export const PROFILE = {
    PREFIX: 'PROFILE',
    /* ACTION: {

    }, */
    STATE: {
        ACTIVE:     1,
        SEALED:     1 << 1,
        PINNED:     1 << 2,
    },
};

export const REDUCER = {
    PREFIX: 'REDUCER',
    ACTION: {
        MERGE:      1 << 2,
    },
};

export const COMPLIANCE = {
    PREFIX: 'COMPLIANCE',
    ACTION: {
        VERIFY:     1 << 2,
    },
};

export const DIRECTORY = {
    PREFIX: 'DIRECTORY',
    ACTION: {
        PUBLISH:    1 << 2,
        REVOKE:     1 << 3,
    },
};
