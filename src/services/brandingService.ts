import { invoke } from "@tauri-apps/api/core";

import type {
  BrandingSettings,
  BrandImage,
} from "../types/branding";

export async function getBrandingSettings() {
  return invoke<BrandingSettings>(
    "get_branding_settings",
  );
}

export async function saveBrandingSettings(
  branding: BrandingSettings,
) {
  return invoke<BrandingSettings>(
    "save_branding_settings",
    { branding },
  );
}

export async function importBrandImage(
  sourcePath: string,
  kind: "logo" | "header",
) {
  return invoke<BrandImage>(
    "import_brand_image",
    {
      sourcePath,
      kind,
    },
  );
}

export async function loadBrandImage(
  path: string,
) {
  return invoke<BrandImage>(
    "load_brand_image",
    { path },
  );
}

export async function deleteBrandImage(
  path: string,
) {
  return invoke<void>(
    "delete_brand_image",
    { path },
  );
}