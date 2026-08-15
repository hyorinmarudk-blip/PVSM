// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod database;

use database::{
    models::DatabaseHealth,
    Database,
};

#[tauri::command]
async fn database_health(
    database: tauri::State<'_, Database>,
) -> Result<DatabaseHealth, String> {
    database.health().await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::block_on(async move {
                use tauri::Manager;

                let app_data_dir = app_handle
                    .path()
                    .app_data_dir()
                    .map_err(|error| {
                        format!("Unable to resolve PVSM app data directory: {error}")
                    })?;

                let database = Database::initialize(app_data_dir).await?;

                app_handle.manage(database);

                Ok::<(), String>(())
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            database_health
        ])
        .run(tauri::generate_context!())
        .expect("error while running PVSM");
}
