use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct DatabaseHealth {
    pub connected: bool,
    pub database_path: String,
    pub sqlite_version: String,
    pub schema_version: i64,
}