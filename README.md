# 🚀 ERP Copilot AI

A modern Data Engineering + Analytics + AI project built using:

- Snowflake
- dbt
- Django REST Framework
- React (Coming Next)
- AI Analytics Layer (Coming Next)

ERP Copilot transforms raw ERP data into business-ready insights through a modern data stack.

---

# 📌 Project Architecture

```text
                CSV Files
                     │
                     ▼
          ┌──────────────────┐
          │   Snowflake RAW  │
          └──────────────────┘
                     │
                     ▼
          ┌──────────────────┐
          │ Staging Layer    │
          │ (dbt Models)     │
          └──────────────────┘
                     │
                     ▼
          ┌──────────────────┐
          │ Business Marts   │
          │ (dbt Models)     │
          └──────────────────┘
                     │
                     ▼
          ┌──────────────────┐
          │ Django API Layer │
          └──────────────────┘
                     │
                     ▼
          ┌──────────────────┐
          │ React Dashboard  │
          └──────────────────┘
                     │
                     ▼
          ┌──────────────────┐
          │ AI Copilot Layer │
          └──────────────────┘
```

---

# 🎯 Project Goal

ERP Copilot helps business users answer questions like:

- Which customers generate the most revenue?
- How much revenue is generated every month?
- Which invoices are overdue?
- Which products are running out of stock?
- What is the overall business health?

Without manually writing SQL.

---

# 🛠 Tech Stack

## Data Engineering

- Snowflake
- dbt

## Backend

- Python
- Django
- Django REST Framework

## Frontend

- React
- Recharts

## AI Layer

- OpenAI
- LangChain (Future)

---

# 📂 Project Structure

```text
datapilot-AI/

├── data/
│   ├── customers.csv
│   ├── products.csv
│   ├── orders.csv
│   ├── order_items.csv
│   ├── invoices.csv
│   └── inventory.csv
│
├── snowflake/
│   ├── 001_setup.sql
│   ├── 002_raw_tables.sql
│   └── mart_queries.sql
│
├── dbt/
│   └── erp_copilot/
│
├── backend/
│   ├── analytics/
│   ├── config/
│   └── manage.py
│
└── frontend/
```

---

# 🗄 Database Layers

## RAW Layer

Raw imported CSV tables.

### Tables

- CUSTOMERS
- PRODUCTS
- ORDERS
- ORDER_ITEMS
- INVOICES
- INVENTORY

Purpose:

- Store original data
- No transformations

---

## STAGING Layer

Built using dbt.

### Models

```text
stg_customers
stg_products
stg_orders
stg_order_items
stg_invoices
stg_inventory
```

Purpose:

- Clean data
- Standardize column names
- Prepare for analytics

---

## MART Layer

Business-ready tables.

### customer_revenue

Answers:

```sql
Who are our highest revenue customers?
```

Columns:

```text
customer_id
customer_name
total_orders
total_revenue
```

---

### monthly_revenue

Answers:

```sql
How much revenue are we generating each month?
```

Columns:

```text
revenue_month
total_orders
revenue
```

---

### inventory_health

Answers:

```sql
Which products are low on stock?
```

Columns:

```text
product_id
product_name
stock_quantity
stock_status
```

---

### overdue_invoices

Answers:

```sql
Which invoices need attention?
```

Columns:

```text
invoice_id
customer_id
amount
due_date
status
```

---

# ⚙ dbt Pipeline

## Run Models

```bash
dbt run
```

---

## Run Tests

```bash
dbt test
```

---

## Run Single Model

```bash
dbt run --select stg_customers
```

---

## Generate Documentation

```bash
dbt docs generate
dbt docs serve
```

---

# 🌐 API Layer

Built with Django REST Framework.

Base URL:

```text
http://127.0.0.1:8000/api
```

---

## Top Customers

### Endpoint

```http
GET /api/customers/top/
```

### Response

```json
[
  {
    "CUSTOMER_ID": 15,
    "CUSTOMER_NAME": "Welch-Hill",
    "TOTAL_ORDERS": 5,
    "TOTAL_REVENUE": 559207.27
  }
]
```

---

## Monthly Revenue

### Endpoint

```http
GET /api/revenue/monthly/
```

### Response

```json
[
  {
    "REVENUE_MONTH": "2026-08-01",
    "TOTAL_ORDERS": 54,
    "REVENUE": 1250000
  }
]
```

---

## Inventory Health

### Endpoint

```http
GET /api/inventory/health/
```

### Response

```json
[
  {
    "PRODUCT_ID": 12,
    "PRODUCT_NAME": "Laptop",
    "STOCK_QUANTITY": 3,
    "STOCK_STATUS": "LOW"
  }
]
```

---

## Overdue Invoices

### Endpoint

```http
GET /api/invoices/overdue/
```

### Response

```json
[
  {
    "INVOICE_ID": 15,
    "CUSTOMER_ID": 5,
    "AMOUNT": 45000,
    "STATUS": "OVERDUE"
  }
]
```

---

# ✅ Completed Milestones

## Phase 1

Project Setup

- Git Repository
- Python Virtual Environment
- Folder Structure

Completed ✅

---

## Phase 2

Dataset Generation

- Customers
- Products
- Orders
- Order Items
- Invoices
- Inventory

Completed ✅

---

## Phase 3

Snowflake Setup

- Warehouse
- Database
- Schemas

Completed ✅

---

## Phase 4

Raw Data Layer

- CSV Import
- Validation

Completed ✅

---

## Phase 5

dbt Setup

- Project Initialization
- Snowflake Connection

Completed ✅

---

## Phase 6

Staging Models

Completed ✅

---

## Phase 7

Testing

Completed ✅

---

## Phase 8

Business Marts

Completed ✅

---

## Phase 9

Django API Layer

Completed ✅

---

# 🚧 Current Progress

```text
[██████████░░░░░░░░░░] 65%
```

Completed:

- Snowflake
- dbt
- Data Marts
- Django APIs

Remaining:

- React Dashboard
- Authentication
- AI Copilot
- Deployment

---

# 🎨 Upcoming Dashboard

Cards:

- Total Revenue
- Total Orders
- Overdue Invoices
- Low Stock Products

Charts:

- Revenue Trend
- Top Customers
- Inventory Health

---

# 🤖 Future AI Features

User:

```text
Which customer generated the most revenue?
```

AI:

```text
Welch-Hill generated ₹559,207.27 from 5 orders.
```

---

User:

```text
Show monthly revenue trend.
```

AI:

```text
Revenue increased 18% over the last 3 months.
```

---

# 👨‍💻 Author

Sagar Uttam Bawanthade

MCA Student
MIT World Peace University

Skills:

- Data Engineering
- Snowflake
- dbt
- Python
- Django
- AWS
- Docker
- Kubernetes
- React

---

# ⭐ Project Status

ERP Copilot is currently in active development.

Current Stage:

```text
Data Engineering + Analytics Backend Complete
```

Next Stage:

```text
React Analytics Dashboard
```