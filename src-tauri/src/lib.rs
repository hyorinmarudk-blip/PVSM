// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod branding;
mod database;

use database::{
    models::{
        BrandImage, BrandingSettings, BusinessConfiguration, BusinessProfile, DatabaseHealth,
        PaymentMethod,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::block_on(async move {
                use tauri::Manager;

                let app_data_dir = app_handle.path().app_data_dir().map_err(|error| {
                    format!("Unable to resolve PVSM app data directory: {error}")
                })?;

                let database = Database::initialize(app_data_dir).await?;

                app_handle.manage(database);

                Ok::<(), String>(())
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
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
            delete_brand_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running PVSM");
}
