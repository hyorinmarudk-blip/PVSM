CREATE TABLE IF NOT EXISTS backup_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    uuid TEXT NOT NULL UNIQUE,

    filename TEXT NOT NULL,
    path TEXT NOT NULL,

    backup_type TEXT NOT NULL DEFAULT 'manual',

    created_at TEXT NOT NULL,

    file_size INTEGER NOT NULL DEFAULT 0,
    schema_version INTEGER NOT NULL DEFAULT 0,

    integrity_status TEXT NOT NULL DEFAULT 'unknown',

    notes TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_backup_history_created_at
ON backup_history(created_at DESC);