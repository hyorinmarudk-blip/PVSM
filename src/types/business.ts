export interface BusinessProfile {
  uuid: string;

  business_name: string;
  legal_name: string;
  dba_name: string;

  phone: string;
  email: string;
  website: string;

  address_line_1: string;
  address_line_2: string;

  city: string;
  state: string;
  postal_code: string;
  country: string;

  service_area: string;
  notes: string;

  revision: number;
  sync_status: string;
}

export interface BusinessConfiguration {
  sales_tax_rate: number;

  shop_labor_rate: number;
  mobile_labor_rate: number;
  diagnostic_fee: number;

  invoice_footer: string;
  estimate_footer: string;
  work_order_footer: string;
  warranty_text: string;
}

export interface PaymentMethod {
  uuid: string;
  name: string;
  active: boolean;
  sort_order: number;
}