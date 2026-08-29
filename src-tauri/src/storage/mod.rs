use std::{
    fs,
    path::PathBuf,
};

#[derive(Debug, Clone)]
pub struct AppPaths {
    pub root: PathBuf,

    pub database: PathBuf,

    pub backups: PathBuf,
    pub branding: PathBuf,
    pub exports: PathBuf,
    pub logs: PathBuf,
    pub restore: PathBuf,
}

impl AppPaths {
    pub fn initialize(
        root: PathBuf,
    ) -> Result<Self, String> {
        let paths = Self {
            database:
                root.join("pvsm.db"),

            backups:
                root.join("backups"),

            branding:
                root.join("branding"),

            exports:
                root.join("exports"),

            logs:
                root.join("logs"),

            restore:
                root.join("restore"),

            root,
        };

        for directory in [
            &paths.root,
            &paths.backups,
            &paths.branding,
            &paths.exports,
            &paths.logs,
            &paths.restore,
        ] {
            fs::create_dir_all(directory)
                .map_err(|error| {
                    format!(
                        "Unable to create PVSM directory {}: {error}",
                        directory.display(),
                    )
                })?;
        }

        Ok(paths)
    }
}