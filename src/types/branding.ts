export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export interface BrandingSettings {
  logo_path: string | null;
  header_image_path: string | null;

  primary_color: string;
  secondary_color: string;
  accent_color: string;

  theme_mode: ThemeMode;
}

export interface BrandImage {
  path: string;
  data_url: string;
}