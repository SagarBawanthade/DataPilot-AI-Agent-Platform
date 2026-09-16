select
    p.product_id,
    p.product_name,
    p.reorder_level,
    i.current_stock,

    case
        when i.current_stock <= p.reorder_level
        then 'RESTOCK'
        else 'OK'
    end as inventory_status

from {{ ref('stg_products') }} p

join {{ ref('stg_inventory') }} i
    on p.product_id = i.product_id