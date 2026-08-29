// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod branding;
mod database;
mod logging;
mod storage;
mod backup;


use database::{
    models::{
        BrandImage, BrandingSettings, BusinessConfiguration, BusinessProfile, DatabaseHealth,
        PaymentMethod, FrontendLogPayload, BackupRecord, StorageInfo,
    },
    Database,
};

#[tauri::command]
async fn get_branding_settings(
    database: tauri::State<'_, Database>,
) -> Result<BrandingSettings, String> {
    database.branding_settings().await
}

#[tauri::command]
async fn save_branding_settings(
    database: tauri::State<'_, Database>,
    branding: BrandingSettings,
) -> Result<BrandingSettings, String> {
    database.save_branding_settings(branding).await
}

#[tauri::command]
async fn get_business_profile(
    database: tauri::State<'_, Database>,
) -> Result<BusinessProfile, String> {
    database.business_profile().await
}

#[tauri::command]
async fn save_business_profile(
    database: tauri::State<'_, Database>,
    profile: BusinessProfile,
) -> Result<BusinessProfile, String> {
    database.save_business_profile(profile).await
}

#[tauri::command]
async fn get_business_configuration(
    database: tauri::State<'_, Database>,
) -> Result<BusinessConfiguration, String> {
    database.business_configuration().await
}

#[tauri::command]
async fn save_business_configuration(
    database: tauri::State<'_, Database>,
    configuration: BusinessConfiguration,
) -> Result<BusinessConfiguration, String> {
    database.save_business_configuration(configuration).await
}

#[tauri::command]
async fn get_payment_methods(
    database: tauri::State<'_, Database>,
) -> Result<Vec<PaymentMethod>, String> {
    database.payment_methods().await
}

#[tauri::command]
async fn database_health(database: tauri::State<'_, Database>) -> Result<DatabaseHealth, String> {
    database.health().await
}

#[tauri::command]
async fn import_brand_image(
    app: tauri::AppHandle,
    source_path: String,
    kind: String,
) -> Result<BrandImage, String> {
    use tauri::Manager;

    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Unable to resolve PVSM app data directory: {error}"))?;

    branding::import_brand_image(app_data_dir, source_path, kind)
}

#[tauri::command]
async fn load_brand_image(path: String) -> Result<BrandImage, String> {
    branding::load_brand_image(path)
}

#[tauri::command]
async fn delete_brand_image(path: String) -> Result<(), String> {
    branding::delete_brand_image(path)
}

#[tauri::command]
async fn create_manual_backup(
    database:
        tauri::State<'_, Database>,

    paths:
        tauri::State<'_, storage::AppPaths>,
) -> Result<BackupRecord, String> {
    backup::create_backup(
        database.pool(),
        &paths,
        "manual",
        "Manual backup",
    )
    .await
}

#[tauri::command]
async fn get_backup_history(
    database:
        tauri::State<'_, Database>,
) -> Result<
    Vec<BackupRecord>,
    String,
> {
    backup::list_backups(
        database.pool(),
    )
    .await
}

#[tauri::command]
async fn get_storage_info(
    paths:
        tauri::State<'_, storage::AppPaths>,
) -> Result<StorageInfo, String> {
    Ok(
        StorageInfo {
            app_data_path:
                paths.root
                    .display()
                    .to_string(),

            database_path:
                paths.database
                    .display()
                    .to_string(),

            backup_path:
                paths.backups
                    .display()
                    .to_string(),

            branding_path:
                paths.branding
                    .display()
                    .to_string(),

            export_path:
                paths.exports
                    .display()
                    .to_string(),

            log_path:
                paths.logs
                    .display()
                    .to_string(),
        },
    )
}

#[tauri::command]
async fn write_frontend_log(
    payload: FrontendLogPayload,
) -> Result<(), String> {
    match payload.level
        .trim()
        .to_lowercase()
        .as_str()
    {
        "warn" => {
            tracing::warn!(
                context =
                    payload
                        .context
                        .as_deref()
                        .unwrap_or("frontend"),
                details =
                    payload
                        .details
                        .as_deref()
                        .unwrap_or(""),
                "{}",
                payload.message
            );
        }

        "info" => {
            tracing::info!(
                context =
                    payload
                        .context
                        .as_deref()
                        .unwrap_or("frontend"),
                details =
                    payload
                        .details
                        .as_deref()
                        .unwrap_or(""),
                "{}",
                payload.message
            );
        }

        _ => {
            tracing::error!(
                context =
                    payload
                        .context
                        .as_deref()
                        .unwrap_or("frontend"),
                details =
                    payload
                        .details
                        .as_deref()
                        .unwrap_or(""),
                "{}",
                payload.message
            );
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
    use tauri::Manager;


    let app_data_dir =
        app.path()
            .app_data_dir()
            .map_err(|error| {
                format!(
                    "Unable to resolve PVSM app data directory: {error}"
                )
            })?;


            let paths =
    storage::AppPaths::initialize(
        app_data_dir,
    )?;

    let logging_guard =
        logging::initialize(
paths.root.clone(),
        )?;

    app.manage(logging_guard);

    tracing::info!(
        "PVSM 6 startup beginning"
    );

    let app_handle =
        app.handle().clone();

    tauri::async_runtime::block_on(
        async move {
            let database =
                Database::initialize(
                    paths.database.clone(),
                )
                .await
                .map_err(|error| {
                    tracing::error!(
                        error = %error,
                        "Database initialization failed"
                    );

                    error
                })?;
            app.manage(paths);    
            app_handle.manage(database);

            tracing::info!(
                "PVSM database initialized successfully"
            );

            Ok::<(), String>(())
        },
    )?;

    Ok(())
})
        .invoke_handler(tauri::generate_handler![
            write_frontend_log,
            database_health,
            get_business_profile,
            save_business_profile,
            get_business_configuration,
            save_business_configuration,
            get_payment_methods,
            get_branding_settings,
            save_branding_settings,
            import_brand_image,
            load_brand_image,
            create_manual_backup,
            get_backup_history,
            get_storage_info,
            delete_brand_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running PVSM");
    }
