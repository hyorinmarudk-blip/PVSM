use std::{
    fs,
    path::{
        Path,
        
    },
};

use chrono::Utc;
use sqlx::{
    sqlite::{
        SqliteConnectOptions,
        SqlitePoolOptions,
    },
    Row,
    SqlitePool,
};
use uuid::Uuid;

use crate::{
    database::models::BackupRecord,
    storage::AppPaths,
};

pub async fn create_backup(
    pool: &SqlitePool,
    paths: &AppPaths,
    backup_type: &str,
    notes: &str,
) -> Result<BackupRecord, String> {
    let timestamp =
        Utc::now()
            .format("%Y-%m-%d_%H-%M-%S")
            .to_string();

    let filename =
        format!(
            "PVSM_Backup_{timestamp}.db"
        );

    let destination =
        paths.backups.join(
            &filename,
        );

    if destination.exists() {
        return Err(
            "Backup destination already exists."
                .into(),
        );
    }

    tracing::info!(
        destination =
            %destination.display(),
        "Creating PVSM backup"
    );

    sqlx::query(
        "PRAGMA wal_checkpoint(FULL)",
    )
    .execute(pool)
    .await
    .map_err(|error| {
        format!(
            "Unable to checkpoint SQLite before backup: {error}"
        )
    })?;

    sqlx::query(
        "VACUUM INTO ?",
    )
    .bind(
        destination
            .to_string_lossy()
            .to_string(),
    )
    .execute(pool)
    .await
    .map_err(|error| {
        format!(
            "Unable to create SQLite backup: {error}"
        )
    })?;

    let integrity =
        validate_database(
            &destination,
        )
        .await?;

    if integrity != "ok" {
        let _ =
            fs::remove_file(
                &destination,
            );

        return Err(
            format!(
                "Backup failed integrity validation: {integrity}"
            ),
        );
    }

    let metadata =
        fs::metadata(
            &destination,
        )
        .map_err(|error| {
            format!(
                "Unable to read backup metadata: {error}"
            )
        })?;

    let schema_version: i64 =
        sqlx::query_scalar(
            r#"
            SELECT schema_version
            FROM app_meta
            WHERE id = 1
            "#,
        )
        .fetch_one(pool)
        .await
        .map_err(|error| {
            error.to_string()
        })?;

    let record =
        BackupRecord {
            uuid:
                Uuid::new_v4()
                    .to_string(),

            filename,

            path:
                destination
                    .to_string_lossy()
                    .to_string(),

            backup_type:
                backup_type
                    .to_string(),

            created_at:
                Utc::now()
                    .to_rfc3339(),

            file_size:
                metadata.len() as i64,

            schema_version,

            integrity_status:
                "ok".into(),

            notes:
                notes.to_string(),
        };

    sqlx::query(
        r#"
        INSERT INTO backup_history (
            uuid,
            filename,
            path,
            backup_type,
            created_at,
            file_size,
            schema_version,
            integrity_status,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&record.uuid)
    .bind(&record.filename)
    .bind(&record.path)
    .bind(&record.backup_type)
    .bind(&record.created_at)
    .bind(record.file_size)
    .bind(record.schema_version)
    .bind(&record.integrity_status)
    .bind(&record.notes)
    .execute(pool)
    .await
    .map_err(|error| {
        format!(
            "Unable to save backup history: {error}"
        )
    })?;

    tracing::info!(
        file = %record.filename,
        "PVSM backup completed"
    );

    Ok(record)
}

pub async fn validate_database(
    database_path: &Path,
) -> Result<String, String> {
    if !database_path.exists() {
        return Err(
            "Database file does not exist."
                .into(),
        );
    }

    let options =
        SqliteConnectOptions::new()
            .filename(database_path)
            .read_only(true);

    let pool =
        SqlitePoolOptions::new()
            .max_connections(1)
            .connect_with(options)
            .await
            .map_err(|error| {
                format!(
                    "Unable to open database for validation: {error}"
                )
            })?;

    let result: String =
        sqlx::query_scalar(
            "PRAGMA integrity_check",
        )
        .fetch_one(
            &pool,
        )
        .await
        .map_err(|error| {
            error.to_string()
        })?;

    pool.close().await;

    Ok(result)
}

pub async fn list_backups(
    pool: &SqlitePool,
) -> Result<
    Vec<BackupRecord>,
    String,
> {
    let rows =
        sqlx::query(
            r#"
            SELECT
                uuid,
                filename,
                path,
                backup_type,
                created_at,
                file_size,
                schema_version,
                integrity_status,
                notes
            FROM backup_history
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(pool)
        .await
        .map_err(|error| {
            error.to_string()
        })?;

    Ok(
        rows.into_iter()
            .map(|row| {
                BackupRecord {
                    uuid:
                        row.get("uuid"),

                    filename:
                        row.get("filename"),

                    path:
                        row.get("path"),

                    backup_type:
                        row.get(
                            "backup_type",
                        ),

                    created_at:
                        row.get(
                            "created_at",
                        ),

                    file_size:
                        row.get(
                            "file_size",
                        ),

                    schema_version:
                        row.get(
                            "schema_version",
                        ),

                    integrity_status:
                        row.get(
                            "integrity_status",
                        ),

                    notes:
                        row.get("notes"),
                }
            })
            .collect(),
    )
}