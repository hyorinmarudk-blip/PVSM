use std::{
    fs,
    path::{Path, PathBuf},
};

use base64::{
    engine::general_purpose::STANDARD,
    Engine,
};

use crate::database::models::BrandImage;

const ALLOWED_EXTENSIONS: [&str; 5] = [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
];

fn validate_kind(kind: &str) -> Result<(), String> {
    match kind {
        "logo" | "header" => Ok(()),
        _ => Err(
            "Brand image type must be logo or header."
                .to_string(),
        ),
    }
}

fn validate_image(path: &Path) -> Result<String, String> {
    if !path.exists() {
        return Err("Selected image does not exist.".into());
    }

    if !path.is_file() {
        return Err("Selected path is not a file.".into());
    }

    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_lowercase();

    if !ALLOWED_EXTENSIONS.contains(
        &extension.as_str(),
    ) {
        return Err(
            "Supported image formats are PNG, JPG, JPEG, WEBP, and GIF."
                .into(),
        );
    }

    Ok(extension)
}

fn mime_type(extension: &str) -> &'static str {
    match extension {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        _ => "application/octet-stream",
    }
}

pub fn import_brand_image(
    app_data_dir: PathBuf,
    source_path: String,
    kind: String,
) -> Result<BrandImage, String> {
    validate_kind(&kind)?;

    let source = PathBuf::from(source_path);

    let extension =
        validate_image(&source)?;

    let branding_dir =
        app_data_dir.join("branding");

    fs::create_dir_all(&branding_dir)
        .map_err(|error| {
            format!(
                "Unable to create branding directory: {error}"
            )
        })?;

    let filename = format!(
        "{kind}.{extension}"
    );

    let destination =
        branding_dir.join(filename);

    fs::copy(
        &source,
        &destination,
    )
    .map_err(|error| {
        format!(
            "Unable to copy branding image: {error}"
        )
    })?;

    load_brand_image(
        destination
            .to_string_lossy()
            .to_string(),
    )
}

pub fn load_brand_image(
    path: String,
) -> Result<BrandImage, String> {
    let image_path =
        PathBuf::from(&path);

    let extension =
        validate_image(&image_path)?;

    let bytes =
        fs::read(&image_path)
            .map_err(|error| {
                format!(
                    "Unable to read branding image: {error}"
                )
            })?;

    let encoded =
        STANDARD.encode(bytes);

    let data_url = format!(
        "data:{};base64,{}",
        mime_type(&extension),
        encoded,
    );

    Ok(BrandImage {
        path,
        data_url,
    })
}

pub fn delete_brand_image(
    path: String,
) -> Result<(), String> {
    let image_path =
        PathBuf::from(path);

    if image_path.exists() {
        fs::remove_file(
            image_path,
        )
        .map_err(|error| {
            format!(
                "Unable to remove branding image: {error}"
            )
        })?;
    }

    Ok(())
}