SELECT
    c.customer_id,
    c.customer_name,
    COUNT(DISTINCT o.order_id) AS total_orders,
    ROUND(SUM(o.total_amount), 2) AS total_revenue
FROM {{ ref('stg_customers') }} c
JOIN {{ ref('stg_orders') }} o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name