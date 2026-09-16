import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  Send,
  User,
  Trash2,
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";
import { askCopilot } from "../services/api";
import { formatCurrency, formatMonthLabel } from "../utils/formatters";

let globalMessageId = 0;
function createMessageId(prefix = "msg") {
  globalMessageId += 1;
  return `${prefix}-${globalMessageId}`;
}

// Suggested prompt quick chips
const SUGGESTED_PROMPTS = [
  {
    label: "Top 10 Customers",
    query: "Show top 10 enterprise customers",
    icon: Users,
    color: "from-blue-500/10 to-indigo-500/10 text-indigo-700 border-indigo-200 hover:border-indigo-400",
  },
  {
    label: "Monthly Revenue",
    query: "What is our monthly revenue breakdown?",
    icon: TrendingUp,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200 hover:border-emerald-400",
  },
  {
    label: "Critical Stock Alert",
    query: "Which inventory items require restocking?",
    icon: Package,
    color: "from-amber-500/10 to-rose-500/10 text-amber-700 border-amber-200 hover:border-amber-400",
  },
  {
    label: "Overdue Invoices",
    query: "List all overdue customer invoices",
    icon: CreditCard,
    color: "from-rose-500/10 to-red-500/10 text-rose-700 border-rose-200 hover:border-rose-400",
  },
];

export default function CopilotChat({
  variant = "full", // 'full' (full-page tab) or 'drawer' (slide-out widget)
  onClose = null,
  onNavigateTab = null,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "assistant",
      type: "welcome",
      time: "Just now",
      text: "👋 Hi! I am your DataPilot ERP Copilot, connected directly to your Snowflake Analytics Warehouse. Ask me any question about enterprise customers, monthly revenue, inventory health, or overdue invoices.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedJson, setExpandedJson] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Classify response type based on Snowflake data payload
  const detectPayloadType = (data) => {
    if (Array.isArray(data)) {
      if (data.length === 0) return "empty";
      const sample = data[0];
      if (sample.CUSTOMER_NAME !== undefined && sample.TOTAL_REVENUE !== undefined) {
        return "customers";
      }
      if (sample.REVENUE_MONTH !== undefined || sample.REVENUE !== undefined) {
        return "revenue";
      }
      if (sample.STOCK_STATUS !== undefined || sample.CURRENT_STOCK !== undefined) {
        return "inventory";
      }
      if (sample.INVOICE_ID !== undefined || sample.DUE_DATE !== undefined) {
        return "invoices";
      }
      return "generic_table";
    }

    if (typeof data === "object" && data !== null) {
      if (data.error) return "error";
      if (data.message) return "text";
      return "json";
    }

    return "text";
  };

  // Submit question
  const handleSend = useCallback(
    async (questionText = null) => {
      const query = (questionText ?? input).trim();
      if (!query || loading) return;

      const userMessage = {
        id: createMessageId("user"),
        sender: "user",
        text: query,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const res = await askCopilot(query);
        const payloadType = detectPayloadType(res.data);

        const assistantMessage = {
          id: createMessageId("assistant"),
          sender: "assistant",
          type: payloadType,
          raw: res.data,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text:
            typeof res.data === "object" && res.data?.message
              ? res.data.message
              : null,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error("Copilot query failed:", err);
        const errorMessage = {
          id: createMessageId("error"),
          sender: "assistant",
          type: "error",
          text:
            err.response?.data?.message ||
            "Unable to query Snowflake warehouse. Ensure backend service is running on port 8000.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = useCallback(() => {
    setMessages([
      {
        id: createMessageId("welcome"),
        sender: "assistant",
        type: "welcome",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: "👋 Chat reset. What would you like to investigate in Snowflake next?",
      },
    ]);
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleJson = (id) => {
    setExpandedJson((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isDrawer = variant === "drawer";

  return (
    <div
      className={`flex flex-col bg-white border border-slate-200/80 shadow-sm overflow-hidden ${
        isDrawer
          ? "h-full w-full rounded-2xl"
          : "min-h-[640px] h-[calc(100vh-140px)] rounded-2xl"
      }`}
    >
      {/* ================= HEADER ================= */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/20">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                DataPilot AI Copilot
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                Snowflake DW Live
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Conversational intelligence for your ERP analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Copilot"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ================= MESSAGE STREAM ================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {msg.sender === "user" ? (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                  <User size={15} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles size={15} />
                </div>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`flex flex-col space-y-2 ${
                msg.sender === "user" ? "items-end max-w-[85%]" : "items-start w-full"
              }`}
            >
              {/* Message Header info */}
              <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                <span className="font-medium text-slate-600">
                  {msg.sender === "user" ? "You" : "DataPilot Copilot"}
                </span>
                <span>•</span>
                <span>{msg.time || "Just now"}</span>
              </div>

              {/* User Bubble */}
              {msg.sender === "user" && (
                <div className="px-4 py-3 rounded-2xl rounded-tr-xs bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs sm:text-sm font-normal shadow-sm">
                  {msg.text}
                </div>
              )}

              {/* Assistant Bubble */}
              {msg.sender === "assistant" && (
                <div className="w-full bg-white rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-xs p-4 sm:p-5 text-slate-800 text-xs sm:text-sm">
                  {/* Render based on payload type */}
                  {msg.type === "welcome" && (
                    <div className="space-y-4">
                      <p className="text-slate-700 leading-relaxed">
                        {msg.text}
                      </p>
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                          Suggested Questions
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SUGGESTED_PROMPTS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSend(item.query)}
                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border bg-gradient-to-r ${item.color} text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer`}
                              >
                                <Icon size={16} className="shrink-0" />
                                <span className="text-xs font-medium truncate">
                                  {item.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.type === "text" && (
                    <div className="whitespace-pre-line leading-relaxed text-slate-700">
                      {msg.text}
                    </div>
                  )}

                  {msg.type === "error" && (
                    <div className="flex items-start gap-2.5 text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs">Error Querying Warehouse</div>
                        <div className="text-xs mt-0.5">{msg.text}</div>
                      </div>
                    </div>
                  )}

                  {/* CUSTOMERS TABLE VIEW */}
                  {msg.type === "customers" && (
                    <CustomersResultView
                      data={msg.raw}
                      onNavigateTab={onNavigateTab}
                    />
                  )}

                  {/* REVENUE TABLE VIEW */}
                  {msg.type === "revenue" && (
                    <RevenueResultView
                      data={msg.raw}
                      onNavigateTab={onNavigateTab}
                    />
                  )}

                  {/* INVENTORY TABLE VIEW */}
                  {msg.type === "inventory" && (
                    <InventoryResultView
                      data={msg.raw}
                      onNavigateTab={onNavigateTab}
                    />
                  )}

                  {/* INVOICES TABLE VIEW */}
                  {msg.type === "invoices" && (
                    <InvoicesResultView
                      data={msg.raw}
                      onNavigateTab={onNavigateTab}
                    />
                  )}

                  {/* GENERIC DATA / EMPTY */}
                  {msg.type === "generic_table" && (
                    <GenericResultView data={msg.raw} />
                  )}

                  {msg.type === "empty" && (
                    <div className="text-slate-500 italic py-2">
                      Query executed successfully, but returned 0 records.
                    </div>
                  )}

                  {/* Action Bar (Copy & Raw JSON Toggle) */}
                  {msg.type !== "welcome" && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            copyToClipboard(
                              typeof msg.raw === "object"
                                ? JSON.stringify(msg.raw, null, 2)
                                : msg.text || "",
                              msg.id
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={13} className="text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy Response</span>
                            </>
                          )}
                        </button>

                        {msg.raw && (
                          <button
                            onClick={() => toggleJson(msg.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Code2 size={13} />
                            <span>{expandedJson[msg.id] ? "Hide JSON" : "Raw JSON"}</span>
                            {expandedJson[msg.id] ? (
                              <ChevronUp size={13} />
                            ) : (
                              <ChevronDown size={13} />
                            )}
                          </button>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        Snowflake Realtime
                      </span>
                    </div>
                  )}

                  {/* Collapsible Raw JSON preview */}
                  {expandedJson[msg.id] && msg.raw && (
                    <div className="mt-3 relative">
                      <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60">
                        {JSON.stringify(msg.raw, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing / Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={15} className="animate-spin" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-xs px-5 py-4 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs font-medium text-slate-500">
                Querying Snowflake data warehouse...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT FOOTER ================= */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about revenue, top customers, inventory, invoices..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full pl-4 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className={`p-2 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer ${
                input.trim() && !loading
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-xs"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
              title="Send question"
            >
              <Send size={15} />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Press Enter to send</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Analytics Marts
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-RENDERERS FOR RICH ANALYTICS RESULTS
// ==========================================

function CustomersResultView({ data, onNavigateTab }) {
  const topAccounts = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const totalRev = useMemo(
    () => topAccounts.reduce((sum, c) => sum + Number(c.TOTAL_REVENUE || 0), 0),
    [topAccounts]
  );
  const topOne = topAccounts[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">
            Top Enterprise Customers
          </h3>
          <p className="text-xs text-slate-500">
            Retrieved {topAccounts.length} accounts representing {formatCurrency(totalRev)} in aggregate revenue.
          </p>
        </div>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab("customers")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <span>Full Mart</span>
            <ExternalLink size={12} />
          </button>
        )}
      </div>

      {topOne && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              #1
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">
                {topOne.CUSTOMER_NAME}
              </div>
              <div className="text-[11px] text-slate-500">
                {topOne.TOTAL_ORDERS} total orders placed
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="font-bold text-indigo-700 text-xs">
              {formatCurrency(topOne.TOTAL_REVENUE)}
            </div>
            <div className="text-[10px] text-slate-500">Top Account</div>
          </div>
        </div>
      )}

      {/* Mini Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="py-2 px-3 w-8">#</th>
              <th className="py-2 px-3">Customer</th>
              <th className="py-2 px-3 text-center">Orders</th>
              <th className="py-2 px-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topAccounts.slice(0, 5).map((c, idx) => (
              <tr key={c.CUSTOMER_ID || idx} className="hover:bg-slate-50/50">
                <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                <td className="py-2 px-3 font-medium text-slate-800">{c.CUSTOMER_NAME}</td>
                <td className="py-2 px-3 text-center font-mono text-slate-600">
                  {c.TOTAL_ORDERS}
                </td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                  {formatCurrency(c.TOTAL_REVENUE)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {topAccounts.length > 5 && (
        <p className="text-[11px] text-slate-400 italic text-center">
          Showing top 5 of {topAccounts.length} accounts.
        </p>
      )}
    </div>
  );
}

function RevenueResultView({ data, onNavigateTab }) {
  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const latestMonth = list[0];
  const totalRev = useMemo(
    () => list.reduce((sum, r) => sum + Number(r.REVENUE || 0), 0),
    [list]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">
            Monthly Revenue Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Recorded {list.length} monthly financial cycles ({formatCurrency(totalRev)} cumulative).
          </p>
        </div>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab("revenue")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <span>Revenue Chart</span>
            <ExternalLink size={12} />
          </button>
        )}
      </div>

      {latestMonth && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wider">
              Latest Month
            </span>
            <div className="font-bold text-slate-900 text-xs">
              {formatMonthLabel(latestMonth.REVENUE_MONTH)}
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="font-bold text-emerald-700 text-xs">
              {formatCurrency(latestMonth.REVENUE)}
            </div>
            <div className="text-[10px] text-slate-500">
              {latestMonth.TOTAL_ORDERS || latestMonth.ORDERS} orders
            </div>
          </div>
        </div>
      )}

      {/* Mini Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="py-2 px-3">Period</th>
              <th className="py-2 px-3 text-center">Orders</th>
              <th className="py-2 px-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.slice(0, 6).map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-2 px-3 font-medium text-slate-800">
                  {formatMonthLabel(r.REVENUE_MONTH)}
                </td>
                <td className="py-2 px-3 text-center font-mono text-slate-600">
                  {r.TOTAL_ORDERS ?? r.ORDERS ?? 0}
                </td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                  {formatCurrency(r.REVENUE)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryResultView({ data, onNavigateTab }) {
  const items = Array.isArray(data) ? data : [];
  const reorderList = items.filter(
    (i) => (i.STOCK_STATUS || "").toUpperCase() === "REORDER"
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">
            Inventory Health Status
          </h3>
          <p className="text-xs text-slate-500">
            {items.length} SKUs tracked •{" "}
            <span className={reorderList.length > 0 ? "text-rose-600 font-semibold" : "text-emerald-600"}>
              {reorderList.length} items require reorder
            </span>
          </p>
        </div>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab("inventory")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <span>Stock Mart</span>
            <ExternalLink size={12} />
          </button>
        )}
      </div>

      {reorderList.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center gap-2.5 text-rose-800">
          <AlertTriangle size={16} className="shrink-0 text-rose-600" />
          <span className="text-xs">
            <strong>Urgent:</strong> {reorderList.length} SKUs are below their configured reorder thresholds.
          </span>
        </div>
      )}

      {/* Mini Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="py-2 px-3">Product</th>
              <th className="py-2 px-3 text-center">Stock</th>
              <th className="py-2 px-3 text-center">Reorder Lvl</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(reorderList.length > 0 ? reorderList.slice(0, 6) : items.slice(0, 6)).map(
              (p, idx) => {
                const isReorder = (p.STOCK_STATUS || "").toUpperCase() === "REORDER";
                return (
                  <tr key={p.PRODUCT_ID || idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {p.PRODUCT_NAME}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {p.CURRENT_STOCK}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-400">
                      {p.REORDER_LEVEL}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isReorder
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {p.STOCK_STATUS}
                      </span>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoicesResultView({ data, onNavigateTab }) {
  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const totalOverdue = useMemo(
    () => list.reduce((sum, inv) => sum + Number(inv.AMOUNT || 0), 0),
    [list]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">
            Overdue Receivables
          </h3>
          <p className="text-xs text-slate-500">
            {list.length} invoices overdue totaling{" "}
            <span className="font-bold text-rose-600 font-mono">
              {formatCurrency(totalOverdue)}
            </span>
          </p>
        </div>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab("invoices")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <span>Invoices Mart</span>
            <ExternalLink size={12} />
          </button>
        )}
      </div>

      {/* Mini Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="py-2 px-3">Invoice #</th>
              <th className="py-2 px-3">Customer ID</th>
              <th className="py-2 px-3 text-center">Due Date</th>
              <th className="py-2 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.slice(0, 6).map((inv, idx) => (
              <tr key={inv.INVOICE_ID || idx} className="hover:bg-slate-50/50">
                <td className="py-2 px-3 font-mono font-medium text-slate-800">
                  #{inv.INVOICE_ID}
                </td>
                <td className="py-2 px-3 text-slate-600">Cust #{inv.CUSTOMER_ID}</td>
                <td className="py-2 px-3 text-center font-mono text-rose-600">
                  {inv.DUE_DATE}
                </td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                  {formatCurrency(inv.AMOUNT)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {list.length > 6 && (
        <p className="text-[11px] text-slate-400 italic text-center">
          Showing 6 of {list.length} overdue invoices.
        </p>
      )}
    </div>
  );
}

function GenericResultView({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const cols = Object.keys(data[0]);

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-700">Query Results ({data.length} rows)</div>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 font-medium border-b border-slate-100">
            <tr>
              {cols.map((col) => (
                <th key={col} className="py-2 px-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.slice(0, 5).map((row, i) => (
              <tr key={i}>
                {cols.map((col) => (
                  <td key={col} className="py-2 px-3 font-mono text-slate-700">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}