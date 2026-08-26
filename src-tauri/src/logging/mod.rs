use std::{
    fs,
    path::PathBuf,
};

use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::{
    fmt,
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter,
};

pub struct LoggingGuard {
    _file_guard: WorkerGuard,
}

pub fn initialize(
    app_data_dir: PathBuf,
) -> Result<LoggingGuard, String> {
    let log_dir =
        app_data_dir.join("logs");

    fs::create_dir_all(&log_dir)
        .map_err(|error| {
            format!(
                "Unable to create PVSM log directory: {error}"
            )
        })?;

    let file_appender =
        tracing_appender::rolling::daily(
            &log_dir,
            "pvsm.log",
        );

    let (
        file_writer,
        file_guard,
    ) = tracing_appender::non_blocking(
        file_appender,
    );

    let env_filter =
        EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| {
                EnvFilter::new(
                    "pvsm=debug,info",
                )
            });

    let console_layer =
        fmt::layer()
            .with_target(true)
            .with_thread_ids(false)
            .with_thread_names(false);

    let file_layer =
        fmt::layer()
            .with_writer(file_writer)
            .with_ansi(false)
            .with_target(true);

    tracing_subscriber::registry()
        .with(env_filter)
        .with(console_layer)
        .with(file_layer)
        .try_init()
        .map_err(|error| {
            format!(
                "Unable to initialize PVSM logging: {error}"
            )
        })?;

    Ok(LoggingGuard {
        _file_guard: file_guard,
    })
}