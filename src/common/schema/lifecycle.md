# Schema lifecycle

Note: add two destinations to system by default: production and staging.
Schema state is kept in schema metadata inside replicated state machine.

1. Staging
    Staging is the first step in entitlements schema lifecycle. It starts when a schema definition is added to the environment. Staged schema can be utilized to manipulate profile data (e.g. test how profile groups fit the needs), but these compiled profiles can not be promoted to production - only to staging destination. Second limitation is that a schema can not be promoted from staging to production unless its version is >= 1 due to semantic versioning contract (0-based APIs are unstable by default).
2. Production
    When staged schema is promoted to production it becomes usable for production profiles manipulation. Production schema follows automatic semantic versioning in the following manner for an X.Y.Z:
    a. Z is incremented when a rule, description, label or any other non-structural data has changed;
    b. Y is incremented when a property is added to any part of the schema object;
    c. X is incremented when backwards compatibility is broken:
        - property is renamed / removed from schema;
        - property data type changes;
    or manually by an authorized user / service.
    In any time only one schema per snapshot can have same X and Y for an X.Y.Z revision number. This is controlled automatically in order to maintain consistency among profiles. Users can manually promote / revoke schemas rolling back updates. System automatically restores to the latest stable version of production-ready schema. Versions are stored using diffs (diff package in npm) in a Git manner. Internally each version is marked with an sha256.
3. Deprecation
    Any X.Y. schema can be marked as deprecated by authorized user. This means that no new profiles can be derived from this schema, although existing ones will be still functional. These profiles can be marked in UI as those needed to be updated due to schema obsolescence. A schema may not be marked as deprecated before termination.
4. Termination
    Terminated schema is no longer valid, all derived profiles and groups are invalidated as well. Schema is kept for archiv purposes but moved from active state machine to a separate long-term storage along with metadata containing termination info.

A schema can not be restored from a deprecated / terminated state. Instead a new schema with incremented .Z revision number must be promoted to production. As long as it is made production all profiles / groups would be recompiled and valid once again.