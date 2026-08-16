ALTER TABLE business_profile
ADD COLUMN service_area TEXT NOT NULL DEFAULT '';

ALTER TABLE business_profile
ADD COLUMN notes TEXT NOT NULL DEFAULT '';

INSERT OR IGNORE INTO app_settings
(
    key,
    value,
    value_type,
    created_at,
    updated_at
)
VALUES
(
    'sales_tax_rate',
    '0.068',
    'decimal',
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO app_settings
(
    key,
    value,
    value_type,
    created_at,
    updated_at
)
VALUES
(
    'shop_labor_rate',
    '85.00',
    'currency',
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO app_settings
(
    key,
    value,
    value_type,
    created_at,
    updated_at
)
VALUES
(
    'mobile_labor_rate',
    '100.00',
    'currency',
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO app_settings
(
    key,
    value,
    value_type,
    created_at,
    updated_at
)
VALUES
(
    'diagnostic_fee',
    '95.00',
    'currency',
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO app_settings
(
    key,
    value,
    value_type,
    created_at,
    updated_at
)
VALUES
(
    'invoice_footer',
    '',
    'text',
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO app_settings
(
    key,
    value,
    value_type,
    created_at,
    updated_at
)
VALUES
(
    'estimate_footer',
    '',
    'text',
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO app_settings
(
    key,
    value,
    value_type,
    created_at,
    updated_at
)
VALUES
(
    'work_order_footer',
    '',
    'text',
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO app_settings
(
    key,
    value,
    value_type,
    created_at,
    updated_at
)
VALUES
(
    'warranty_text',
    '',
    'text',
    datetime('now'),
    datetime('now')
);