SELECT
    p.product_id,
    p.product_name,
    i.current_stock,
    p.reorder_level,

    CASE
        WHEN i.current_stock <= p.reorder_level
        THEN 'REORDER'
        ELSE 'HEALTHY'
    END AS stock_status

FROM {{ ref('stg_products') }} p
JOIN {{ ref('stg_inventory') }} i
    ON p.product_id = i.product_id