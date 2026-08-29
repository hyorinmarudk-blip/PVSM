pub mod connection;
pub mod models;

use std::path::PathBuf;

use chrono::Utc;
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use connection::{create_pool};

use models::{
    BrandingSettings, BusinessConfiguration, BusinessProfile, DatabaseHealth, PaymentMethod,
};

static MIGRATOR: sqlx::migrate::Migrator = sqlx::migrate!("./migrations");

#[derive(Clone)]
pub struct Database {
    pool: SqlitePool,
    path: PathBuf,
}

impl Database {
    pub async fn initialize(database_path: PathBuf) -> Result<Self, String> {
    let path = database_path;

    tracing::info!(
        path = %path.display(),
        "Initializing PVSM database"
    );

    let pool = create_pool(&path)
        .await
        .map_err(|error| format!("Unable to open PVSM database: {error}"))?;

        MIGRATOR
            .run(&pool)
            .await
            .map_err(|error| format!("Database migration failed: {error}"))?;

        tracing::info!(
    "Database migrations completed"
);

        Self::seed_foundation(&pool)
            .await
            .map_err(|error| format!("Database initialization failed: {error}"))?;

        Self::sync_schema_version(&pool)
            .await
            .map_err(|error| format!("Unable to sync schema version: {error}"))?;

        tracing::info!(
    "Database schema version synchronized"
);

        Ok(Self { pool, path })
    }


    pub fn pool(
    &self,
) -> &SqlitePool {
    &self.pool
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

        let business_uuid: String =
            sqlx::query_scalar("SELECT uuid FROM business_profile WHERE id = 1")
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
        let sqlite_version: String = sqlx::query_scalar("SELECT sqlite_version()")
            .fetch_one(&self.pool)
            .await
            .map_err(|error| error.to_string())?;

        let row = sqlx::query("SELECT schema_version FROM app_meta WHERE id = 1")
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

    pub async fn business_profile(&self) -> Result<BusinessProfile, String> {
        use sqlx::Row;


        let row = sqlx::query(
            r#"
        SELECT
            uuid,
            business_name,
            legal_name,
            dba_name,
            phone,
            email,
            website,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            service_area,
            notes,
            revision,
            sync_status
        FROM business_profile
        WHERE id = 1
        "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        Ok(BusinessProfile {
            uuid: row.get("uuid"),

            business_name: row.get("business_name"),
            legal_name: row.get("legal_name"),
            dba_name: row.get("dba_name"),

            phone: row.get("phone"),
            email: row.get("email"),
            website: row.get("website"),

            address_line_1: row.get("address_line_1"),
            address_line_2: row.get("address_line_2"),
            city: row.get("city"),
            state: row.get("state"),
            postal_code: row.get("postal_code"),
            country: row.get("country"),

            service_area: row.get("service_area"),
            notes: row.get("notes"),

            revision: row.get("revision"),
            sync_status: row.get("sync_status"),
        })
    }

    pub async fn save_business_profile(
        &self,
        profile: BusinessProfile,
    ) -> Result<BusinessProfile, String> {
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            r#"
        UPDATE business_profile
        SET
            business_name = ?,
            legal_name = ?,
            dba_name = ?,

            phone = ?,
            email = ?,
            website = ?,

            address_line_1 = ?,
            address_line_2 = ?,
            city = ?,
            state = ?,
            postal_code = ?,
            country = ?,

            service_area = ?,
            notes = ?,

            updated_at = ?,
            revision = revision + 1,
            sync_status = 'local'
        WHERE id = 1
        "#,
        )
        .bind(profile.business_name.trim())
        .bind(profile.legal_name.trim())
        .bind(profile.dba_name.trim())
        .bind(profile.phone.trim())
        .bind(profile.email.trim())
        .bind(profile.website.trim())
        .bind(profile.address_line_1.trim())
        .bind(profile.address_line_2.trim())
        .bind(profile.city.trim())
        .bind(profile.state.trim())
        .bind(profile.postal_code.trim())
        .bind(profile.country.trim())
        .bind(profile.service_area.trim())
        .bind(profile.notes.trim())
        .bind(now)
        .execute(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        self.business_profile().await
    }

    async fn setting(&self, key: &str) -> Result<String, String> {
        sqlx::query_scalar("SELECT value FROM app_settings WHERE key = ?")
            .bind(key)
            .fetch_one(&self.pool)
            .await
            .map_err(|error| error.to_string())
    }

    async fn save_setting(&self, key: &str, value: String) -> Result<(), String> {
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            r#"
        UPDATE app_settings
        SET
            value = ?,
            updated_at = ?
        WHERE key = ?
        "#,
        )
        .bind(value)
        .bind(now)
        .bind(key)
        .execute(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        Ok(())
    }

    pub async fn business_configuration(&self) -> Result<BusinessConfiguration, String> {
        let sales_tax_rate = self
            .setting("sales_tax_rate")
            .await?
            .parse::<f64>()
            .unwrap_or(0.0);

        let shop_labor_rate = self
            .setting("shop_labor_rate")
            .await?
            .parse::<f64>()
            .unwrap_or(0.0);

        let mobile_labor_rate = self
            .setting("mobile_labor_rate")
            .await?
            .parse::<f64>()
            .unwrap_or(0.0);

        let diagnostic_fee = self
            .setting("diagnostic_fee")
            .await?
            .parse::<f64>()
            .unwrap_or(0.0);

        Ok(BusinessConfiguration {
            sales_tax_rate,
            shop_labor_rate,
            mobile_labor_rate,
            diagnostic_fee,

            invoice_footer: self.setting("invoice_footer").await?,

            estimate_footer: self.setting("estimate_footer").await?,

            work_order_footer: self.setting("work_order_footer").await?,

            warranty_text: self.setting("warranty_text").await?,
        })
    }

    pub async fn save_business_configuration(
        &self,
        configuration: BusinessConfiguration,
    ) -> Result<BusinessConfiguration, String> {
        if configuration.sales_tax_rate < 0.0 {
            return Err("Sales tax rate cannot be negative.".into());
        }

        if configuration.shop_labor_rate < 0.0
            || configuration.mobile_labor_rate < 0.0
            || configuration.diagnostic_fee < 0.0
        {
            return Err("Service rates cannot be negative.".into());
        }

        self.save_setting("sales_tax_rate", configuration.sales_tax_rate.to_string())
            .await?;

        self.save_setting("shop_labor_rate", configuration.shop_labor_rate.to_string())
            .await?;

        self.save_setting(
            "mobile_labor_rate",
            configuration.mobile_labor_rate.to_string(),
        )
        .await?;

        self.save_setting("diagnostic_fee", configuration.diagnostic_fee.to_string())
            .await?;

        self.save_setting("invoice_footer", configuration.invoice_footer)
            .await?;

        self.save_setting("estimate_footer", configuration.estimate_footer)
            .await?;

        self.save_setting("work_order_footer", configuration.work_order_footer)
            .await?;

        self.save_setting("warranty_text", configuration.warranty_text)
            .await?;

        self.business_configuration().await
    }

    pub async fn payment_methods(&self) -> Result<Vec<PaymentMethod>, String> {
        use sqlx::Row;

        let rows = sqlx::query(
            r#"
        SELECT
            uuid,
            name,
            active,
            sort_order
        FROM payment_methods
        ORDER BY sort_order, name
        "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        let methods = rows
            .into_iter()
            .map(|row| PaymentMethod {
                uuid: row.get("uuid"),
                name: row.get("name"),

                active: row.get::<i64, _>("active") != 0,

                sort_order: row.get("sort_order"),
            })
            .collect();

        Ok(methods)
    }

    async fn sync_schema_version(pool: &SqlitePool) -> Result<(), sqlx::Error> {
        let schema_version: i64 = sqlx::query_scalar(
            r#"
        SELECT COALESCE(MAX(version), 0)
        FROM _sqlx_migrations
        WHERE success = 1
        "#,
        )
        .fetch_one(pool)
        .await?;

        let now = Utc::now().to_rfc3339();

        sqlx::query(
            r#"
        UPDATE app_meta
        SET
            schema_version = ?,
            updated_at = ?
        WHERE id = 1
        "#,
        )
        .bind(schema_version)
        .bind(now)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn branding_settings(&self) -> Result<BrandingSettings, String> {
        use sqlx::Row;

        let row = sqlx::query(
            r#"
        SELECT
            logo_path,
            header_image_path,
            primary_color,
            secondary_color,
            accent_color,
            theme_mode
        FROM branding_settings
        WHERE id = 1
        "#,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        Ok(BrandingSettings {
            logo_path: row.get("logo_path"),
            header_image_path: row.get("header_image_path"),

            primary_color: row.get("primary_color"),
            secondary_color: row.get("secondary_color"),
            accent_color: row.get("accent_color"),

            theme_mode: row.get("theme_mode"),
        })
    }

    pub async fn save_branding_settings(
        &self,
        branding: BrandingSettings,
    ) -> Result<BrandingSettings, String> {
        let valid_themes = ["light", "dark", "system"];

        if !valid_themes.contains(&branding.theme_mode.as_str()) {
            return Err("Theme must be light, dark, or system.".into());
        }

        let now = Utc::now().to_rfc3339();

        sqlx::query(
            r#"
        UPDATE branding_settings
        SET
            logo_path = ?,
            header_image_path = ?,
            primary_color = ?,
            secondary_color = ?,
            accent_color = ?,
            theme_mode = ?,
            updated_at = ?
        WHERE id = 1
        "#,
        )
        .bind(branding.logo_path)
        .bind(branding.header_image_path)
        .bind(branding.primary_color.trim())
        .bind(branding.secondary_color.trim())
        .bind(branding.accent_color.trim())
        .bind(branding.theme_mode.trim())
        .bind(now)
        .execute(&self.pool)
        .await
        .map_err(|error| error.to_string())?;

        self.branding_settings().await
    }
}
