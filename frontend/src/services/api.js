import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const getTopCustomers = () => API.get("/customers/top/");
export const getMonthlyRevenue = () => API.get("/revenue/monthly/");
export const getInventoryHealth = () => API.get("/inventory/health/");
export const getOverdueInvoices = () => API.get("/invoices/overdue/");
export const askCopilot = (question) => API.post("/copilot/", { question });

export default API;