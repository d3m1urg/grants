# Schema lifecycle

For test purposes create not only production environment but staging as well.
Schema state is kept in schema metadata inside replicated state machine.

0. Committed
    Committed is the first step in entitlements schema lifecycle. A committed schema has no assigned version number. Committed stage allows any schema modification. No compliance checks are done at this stage.
1. Staging
    Staging is the second step in entitlements schema lifecycle. Staged schema is freezed - it can not be directly manipulated. Its main purpose is to analyse how the newly created schema matches the existing profiles / groups and how it will affect them when promoted to production. Staged schema can be utilized to manipulate profile data (e.g. test how profile groups fit the needs), but these compiled profiles can not be promoted to production - only to staging destination. Second limitation is that a schema can not be promoted from staging to production unless its version is >= 1 due to semantic versioning contract (0-based APIs are unstable by definitions). When schema is in staging its versioning is not controlled by the system but rather by the user. System only proposes possible version incrementation.
2. Production
    When staged schema is promoted to production it becomes usable for production profiles manipulation. Production schema follows automatic semantic versioning in the following manner for an X.Y.Z:
    a. Z is incremented when a rule, description, label or any other non-structural data has changed;
    b. Y is incremented when a property is added to any part of the schema object;
    c. X is incremented when backwards compatibility is broken:
        - property is renamed / removed from schema;
        - property data type changes;
    or manually by an authorized user / service.
    In any time only one schema per system snapshot can have same X and Y for an X.Y.Z revision number for an active schema. This is controlled automatically in order to maintain consistency among profiles. Users can manually promote / revoke schemas rolling back updates. System automatically restores to the latest stable version of production-ready schema. Versions are stored using diffs (diff package in npm) in a Git manner. Internally each version is marked with an sha256.
3. Deprecation
    Any X.Y. schema can be marked as deprecated by authorized user. This means that no new profiles can be derived from this schema, although existing ones will be still functional. These profiles can be marked in UI as those needed to be updated due to schema obsolescence. A schema may not be marked as deprecated before termination.
4. Termination
    Terminated schema is no longer valid, all derived profiles and groups are invalidated as well. Schema is kept for archiv purposes but moved from active state machine to a separate long-term storage along with metadata containing termination info.

A schema can not be restored from a deprecated / terminated state. Instead a new schema with incremented .Z revision number must be promoted to production. As long as it is made production all profiles / groups would be recompiled and valid once again.

Question: do we need to include versioning data into any kind of user metadata or it's better to make implicit assumptions regarding user access control?
Problem: there're N API revisions in production which require different entitlements schemas.
Solution: each user entitlement must be tagged with schema id (name) and version number. When an API requests user entitlements a request should contain the userId, schema version and optionally a set of rules regarding version, e.g. =, >=, <=, != with an opportunity to use * instead of numbers in version string. Rule engine can be implemented as simple PEG grammar.
Note that it implies that all profiles must be reassessed each time a schema version is promoted - especially when a rule is updated which can affect schema validation. It can be done as a part of staging process - a comprehensive check how the staged schema would affect existing profiles / environment. To do batch updates an SQL-like DSL may be used (future versions, not MVP).

When a new schema is enrolled to production a so-called transition period starts. During this period users that were not switched to a new version of schema are still assessed agains old version and automatically receive upgraded (recalculated) entitlements definitions.

BTW it's a good idea to use JSON-RPC as system implementation protocol.