export interface BackupRecord {
  uuid: string;

  filename: string;
  path: string;

  backup_type: string;

  created_at: string;

  file_size: number;
  schema_version: number;

  integrity_status: string;

  notes: string;
}

export interface StorageInfo {
  app_data_path: string;
  database_path: string;
  backup_path: string;
  branding_path: string;
  export_path: string;
  log_path: string;
}