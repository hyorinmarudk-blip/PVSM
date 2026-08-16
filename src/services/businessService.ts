import { invoke } from "@tauri-apps/api/core";

import type {
  BusinessConfiguration,
  BusinessProfile,
  PaymentMethod,
} from "../types/business";

export async function getBusinessProfile() {
  return invoke<BusinessProfile>(
    "get_business_profile",
  );
}

export async function saveBusinessProfile(
  profile: BusinessProfile,
) {
  return invoke<BusinessProfile>(
    "save_business_profile",
    { profile },
  );
}

export async function getBusinessConfiguration() {
  return invoke<BusinessConfiguration>(
    "get_business_configuration",
  );
}

export async function saveBusinessConfiguration(
  configuration: BusinessConfiguration,
) {
  return invoke<BusinessConfiguration>(
    "save_business_configuration",
    { configuration },
  );
}

export async function getPaymentMethods() {
  return invoke<PaymentMethod[]>(
    "get_payment_methods",
  );
}