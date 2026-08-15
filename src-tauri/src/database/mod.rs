pub mod connection;
pub mod models;

use std::path::PathBuf;

use chrono::Utc;
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use connection::{create_pool, database_file};
use models::DatabaseHealth;

static MIGRATOR: sqlx::migrate::Migrator =
    sqlx::migrate!("./migrations");

#[derive(Clone)]
pub struct Database {
    pool: SqlitePool,
    path: PathBuf,
}

impl Database {
    pub async fn initialize(app_data_dir: PathBuf) -> Result<Self, String> {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|error| format!("Unable to create PVSM data directory: {error}"))?;

        let path = database_file(app_data_dir);

        let pool = create_pool(&path)
            .await
            .map_err(|error| format!("Unable to open PVSM database: {error}"))?;

        MIGRATOR
            .run(&pool)
            .await
            .map_err(|error| format!("Database migration failed: {error}"))?;

        Self::seed_foundation(&pool)
            .await
            .map_err(|error| format!("Database initialization failed: {error}"))?;

        Ok(Self { pool, path })
    }

    async fn seed_foundation(pool: &SqlitePool) -> Result<(), sqlx::Error> {
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            r#"
            INSERT OR IGNORE INTO app_meta (
                id,
                database_uuid,
                schema_version,
                created_at,
                updated_at
            )
            VALUES (1, ?, 1, ?, ?)
            "#,
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&now)
        .bind(&now)
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            INSERT OR IGNORE INTO business_profile (
                id,
                uuid,
                created_at,
                updated_at
            )
            VALUES (1, ?, ?, ?)
            "#,
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&now)
        .bind(&now)
        .execute(pool)
        .await?;

        let business_uuid: String = sqlx::query_scalar(
            "SELECT uuid FROM business_profile WHERE id = 1",
        )
        .fetch_one(pool)
        .await?;

        sqlx::query(
            r#"
            INSERT OR IGNORE INTO branding_settings (
                id,
                business_profile_uuid,
                created_at,
                updated_at
            )
            VALUES (1, ?, ?, ?)
            "#,
        )
        .bind(business_uuid)
        .bind(&now)
        .bind(&now)
        .execute(pool)
        .await?;

        let methods = [
            ("Cash", 10),
            ("Card", 20),
            ("Check", 30),
            ("Bank Transfer", 40),
            ("Cash App", 50),
            ("Other", 60),
        ];

        for (name, sort_order) in methods {
            sqlx::query(
                r#"
                INSERT OR IGNORE INTO payment_methods (
                    uuid,
                    name,
                    active,
                    sort_order,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, 1, ?, ?, ?)
                "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(name)
            .bind(sort_order)
            .bind(&now)
            .bind(&now)
            .execute(pool)
            .await?;
        }

        Ok(())
    }

    pub async fn health(&self) -> Result<DatabaseHealth, String> {
        let sqlite_version: String =
            sqlx::query_scalar("SELECT sqlite_version()")
                .fetch_one(&self.pool)
                .await
                .map_err(|error| error.to_string())?;

        let row = sqlx::query(
            "SELECT schema_version FROM app_meta WHERE id = 1",
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        let schema_version: i64 = row
            .try_get("schema_version")
            .map_err(|error| error.to_string())?;

        Ok(DatabaseHealth {
            connected: true,
            database_path: self.path.display().to_string(),
            sqlite_version,
            schema_version,
        })
    }
}