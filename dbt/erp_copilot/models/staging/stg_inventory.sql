select
    inventory_id,
    product_id,
    current_stock,
    last_updated
from {{ source('raw', 'INVENTORY') }}