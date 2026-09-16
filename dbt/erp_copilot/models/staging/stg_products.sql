select
    product_id,
    product_name,
    category,
    unit_price,
    reorder_level,
    created_at
from {{ source('raw', 'PRODUCTS') }}