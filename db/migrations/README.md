# MySQL Migrations

The application records applied versions in `schema_migrations` and runs pending safety/event migrations through `sqliteStore.ensureReady()` at first database use. The implementation uses InnoDB transactions and row locks; SQLite WAL is not used because this project now targets MySQL.

Migration `1` creates reservations, executor state, provider-event deduplication, outbox, and payouts. Migration `2` creates the event log, consumer offsets, and event schema registry. The executable definitions are kept in `server/services/sqliteStore.ts` to keep the Node deployment self-contained.

For a rollback, stop workers first, back up the database, and reverse only the affected migration tables manually. Do not drop `action_reservations` or `executor_states` while workers are running. A production deployment should add a reviewed down migration after the forward migration has been applied in staging.