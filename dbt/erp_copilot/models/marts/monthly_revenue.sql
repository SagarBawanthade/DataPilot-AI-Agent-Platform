SELECT
    DATE_TRUNC('month', order_date) AS revenue_month,
    COUNT(order_id) AS total_orders,
    ROUND(SUM(total_amount), 2) AS revenue
FROM {{ ref('stg_orders') }}
GROUP BY revenue_month
ORDER BY revenue_month