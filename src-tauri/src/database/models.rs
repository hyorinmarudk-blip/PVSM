use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct DatabaseHealth {
    pub connected: bool,
    pub database_path: String,
    pub sqlite_version: String,
    pub schema_version: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrandingSettings {
    pub logo_path: Option<String>,
    pub header_image_path: Option<String>,

    pub primary_color: String,
    pub secondary_color: String,
    pub accent_color: String,

    pub theme_mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrandImage {
    pub path: String,
    pub data_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessProfile {
    pub uuid: String,

    pub business_name: String,
    pub legal_name: String,
    pub dba_name: String,

    pub phone: String,
    pub email: String,
    pub website: String,

    pub address_line_1: String,
    pub address_line_2: String,
    pub city: String,
    pub state: String,
    pub postal_code: String,
    pub country: String,

    pub service_area: String,
    pub notes: String,

    pub revision: i64,
    pub sync_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessConfiguration {
    pub sales_tax_rate: f64,

    pub shop_labor_rate: f64,
    pub mobile_labor_rate: f64,
    pub diagnostic_fee: f64,

    pub invoice_footer: String,
    pub estimate_footer: String,
    pub work_order_footer: String,
    pub warranty_text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentMethod {
    pub uuid: String,
    pub name: String,
    pub active: bool,
    pub sort_order: i64,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct FrontendLogPayload {
    pub level: String,
    pub message: String,
    pub context: Option<String>,
    pub details: Option<String>,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct BackupRecord {
    pub uuid: String,

    pub filename: String,
    pub path: String,

    pub backup_type: String,

    pub created_at: String,

    pub file_size: i64,
    pub schema_version: i64,

    pub integrity_status: String,

    pub notes: String,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct StorageInfo {
    pub app_data_path: String,
    pub database_path: String,
    pub backup_path: String,
    pub branding_path: String,
    pub export_path: String,
    pub log_path: String,
}