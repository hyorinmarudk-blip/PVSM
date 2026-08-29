import {
  invoke,
} from "@tauri-apps/api/core";

import type {
  BackupRecord,
  StorageInfo,
} from "../types/backup";

export function createManualBackup() {
  return invoke<BackupRecord>(
    "create_manual_backup",
  );
}

export function getBackupHistory() {
  return invoke<BackupRecord[]>(
    "get_backup_history",
  );
}

export function getStorageInfo() {
  return invoke<StorageInfo>(
    "get_storage_info",
  );
}