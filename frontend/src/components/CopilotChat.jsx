import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { askCopilot as apiAskCopilot } from "../services/api";
import {
  Sparkles,
  ArrowUp,
  RotateCcw,
  X,
  Database,
  Table,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Package,
  Users,
  CreditCard,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  formatMonthLabel,
  formatFullDate,
} from "../utils/formatters";

// ==========================================
// 1. MARKDOWN PARSER & RENDERER COMPONENT
// ==========================================

function renderInlineText(text) {
  if (!text) return null;

  const tokens = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex to match bold (**text**), inline code (`code`), and italic (*text*)
  const regex = /(\*\*.*?\*\*|`.*?`|\*[^*]+\*)/;

  while (remaining) {
    const match = remaining.match(regex);
    if (!match) {
      tokens.push(remaining);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      tokens.push(remaining.substring(0, matchIndex));
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      tokens.push(
        <strong key={keyIdx++} className="font-semibold text-slate-900">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
      tokens.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-xs border border-slate-200/80"
        >
          {matchedStr.slice(1, -1)}
        </code>
      );
    } else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
      tokens.push(
        <em key={keyIdx++} className="italic text-slate-800">
          {matchedStr.slice(1, -1)}
        </em>
      );
    } else {
      tokens.push(matchedStr);
    }

    remaining = remaining.substring(matchIndex + matchedStr.length);
  }

  return tokens;
}

function parseMarkdownBlocks(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal Rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].replace(/\*\*/g, ""),
      });
      i++;
      continue;
    }

    // Markdown Table
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0].split("|").slice(1, -1).map((h) => h.trim());
        const rows = tableLines
          .slice(2)
          .map((r) => r.split("|").slice(1, -1).map((c) => c.trim()));
        blocks.push({
          type: "table",
          headers: rawHeaders,
          rows,
        });
        continue;
      }
    }

    // Code Block
    if (line.trim().startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({
        type: "code",
        content: codeLines.join("\n"),
      });
      continue;
    }

    // Bullet or Numbered List
    const listMatch = line.match(/^(\s*)([*•-]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const listItems = [];
      while (i < lines.length) {
        const itemMatch = lines[i].match(/^(\s*)([*•-]|\d+\.)\s+(.+)$/);
        if (itemMatch) {
          listItems.push({
            indent: itemMatch[1].length,
            bullet: itemMatch[2],
            isNumber: /^\d+\./.test(itemMatch[2]),
            text: itemMatch[3],
          });
          i++;
        } else if (lines[i].trim() === "") {
          i++;
          break;
        } else {
          break;
        }
      }
      blocks.push({
        type: "list",
        items: listItems,
      });
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular Paragraph
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^#{1,4}\s+/) &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].match(/^(\s*)([*•-]|\d+\.)\s+/) &&
      !/^(-{3,}|\*{3,})\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({
      type: "paragraph",
      text: paraLines.join(" "),
    });
  }

  return blocks;
}

function MarkdownMessage({ content }) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="text-slate-800 space-y-2.5 text-xs sm:text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === "hr") {
          return <hr key={idx} className="my-3.5 border-t border-slate-200/80" />;
        }

        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h1 key={idx} className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-1">
                {renderInlineText(block.text)}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2 key={idx} className="text-sm sm:text-base font-bold text-slate-900 mt-3.5 mb-1 text-indigo-950">
                {renderInlineText(block.text)}
              </h2>
            );
          }
          return (
            <h3 key={idx} className="text-xs sm:text-sm font-bold text-slate-900 mt-3 mb-1 tracking-tight text-indigo-900">
              {renderInlineText(block.text)}
            </h3>
          );
        }

        if (block.type === "table") {
          return (
            <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
              <table className="w-full text-xs text-left border-collapse min-w-[340px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {block.headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-3 py-2 font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                      >
                        {renderInlineText(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700 font-mono text-[11px] sm:text-xs">
                          {renderInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={idx}
              className="my-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto"
            >
              <code>{block.content}</code>
            </pre>
          );
        }

        if (block.type === "list") {
          return (
            <div key={idx} className="space-y-1.5 my-2">
              {block.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-start gap-2 text-slate-700"
                  style={{ marginLeft: `${Math.min(item.indent * 8, 24)}px` }}
                >
                  {item.isNumber ? (
                    <span className="font-semibold text-indigo-600 text-xs w-4 shrink-0">
                      {item.bullet}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1">{renderInlineText(item.text)}</div>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={idx} className="text-slate-700 leading-relaxed">
              {renderInlineText(block.text)}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}

// ==========================================
// 2. DATA INSPECTOR (SNOWFLAKE WAREHOUSE DATA)
// ==========================================

function DataInspector({ data, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState("table"); // 'table' | 'json'
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!Array.isArray(data) || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const displayRows = expanded ? data : data.slice(0, 5);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine relevant destination tab
  const getRelevantTab = () => {
    if (columns.some((c) => c.includes("CUSTOMER"))) return { id: "customers", name: "Top Customers" };
    if (columns.some((c) => c.includes("REVENUE"))) return { id: "revenue", name: "Monthly Revenue" };
    if (columns.some((c) => c.includes("STOCK") || c.includes("SKU"))) return { id: "inventory", name: "Inventory Health" };
    if (columns.some((c) => c.includes("INVOICE") || c.includes("DUE"))) return { id: "invoices", name: "Overdue Invoices" };
    return null;
  };

  const relevantTab = getRelevantTab();

  const formatHeader = (key) => {
    return key
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const formatCellValue = (key, val) => {
    if (val === undefined || val === null) return "—";
    const k = key.toUpperCase();

    if (k.includes("REVENUE") || k.includes("AMOUNT") || k.includes("PRICE")) {
      return (
        <span className="font-semibold text-slate-900 font-mono">
          {formatCurrency(val)}
        </span>
      );
    }
    if (k.includes("STATUS")) {
      const s = String(val).toUpperCase();
      const isBad = s === "REORDER" || s === "OVERDUE";
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            isBad
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {val}
        </span>
      );
    }
    if (k.includes("DATE") || k.includes("MONTH")) {
      return (
        <span className="text-slate-600 font-mono text-[11px]">
          {k.includes("MONTH") ? formatMonthLabel(val) : formatFullDate(val)}
        </span>
      );
    }
    if (typeof val === "number") {
      return <span className="font-mono">{formatNumber(val)}</span>;
    }
    return String(val);
  };

  return (
    <div className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden text-xs">
      {/* Top Bar with View Switcher */}
      <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Database size={13} className="text-indigo-600" />
            <span>Snowflake Warehouse Records</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">
            {data.length} {data.length === 1 ? "row" : "rows"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === "table"
                ? "bg-white text-indigo-700 shadow-2xs font-semibold border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Table size={12} />
            <span>Table</span>
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === "json"
                ? "bg-white text-indigo-700 shadow-2xs font-semibold border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code2 size={12} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "table" ? (
        <div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200 shadow-2xs">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                    >
                      {formatHeader(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white">
                {displayRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-indigo-50/20 transition-colors">
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2 text-slate-700 text-xs">
                        {formatCellValue(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with Expand and Shortcut */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
            {data.length > 5 ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} />
                    <span>Show top 5 only</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} />
                    <span>Show all {data.length} rows</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-slate-400">All rows displayed</span>
            )}

            {relevantTab && onNavigateTab && (
              <button
                onClick={() => onNavigateTab(relevantTab.id)}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer hover:underline"
              >
                <span>Open {relevantTab.name} Mart</span>
                <ExternalLink size={11} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="p-3 bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-64 overflow-y-auto">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
          <button
            onClick={handleCopyJson}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
            title="Copy JSON"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. EMPTY STATE WITH STARTER PROMPT CARDS
// ==========================================

function EmptyState({ onSelectPrompt }) {
  const suggestions = [
    {
      title: "Top Customers",
      prompt: "Who are my top customers?",
      subtitle: "Ranked by total revenue and order volume",
      icon: Users,
      accent: "indigo",
    },
    {
      title: "Monthly Revenue",
      prompt: "Show monthly revenue trend",
      subtitle: "Track historical trends & seasonal peak months",
      icon: TrendingUp,
      accent: "emerald",
    },
    {
      title: "Overdue Invoices",
      prompt: "Any overdue invoices?",
      subtitle: "View delinquent balances and aging debt",
      icon: CreditCard,
      accent: "rose",
    },
    {
      title: "Inventory Health",
      prompt: "How is inventory health?",
      subtitle: "Identify critical stockouts and reorder thresholds",
      icon: Package,
      accent: "amber",
    },
  ];

  const accents = {
    indigo: "border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/40 text-indigo-600 bg-indigo-50",
    emerald: "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-emerald-600 bg-emerald-50",
    rose: "border-rose-100 hover:border-rose-300 hover:bg-rose-50/40 text-rose-600 bg-rose-50",
    amber: "border-amber-100 hover:border-amber-300 hover:bg-amber-50/40 text-amber-600 bg-amber-50",
  };

  return (
    <div className="h-full flex flex-col items-center justify-center py-8 px-4 text-center select-none">
      {/* Glowing AI Icon */}
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1.5">
        How can I help with your ERP data?
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-8">
        Ask natural language questions across Snowflake data marts. Powered by Gemini 2.5 and live data synthesis.
      </p>

      {/* Starter Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          const accentStyle = accents[item.accent];

          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`group p-3.5 rounded-xl border bg-white shadow-2xs hover:shadow-sm transition-all duration-150 cursor-pointer flex items-start gap-3 text-left ${accentStyle}`}
            >
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shrink-0 group-hover:scale-105 transition-transform">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.prompt}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN COPILOT CHAT COMPONENT
// ==========================================

export default function CopilotChat({
  variant = "full", // "full" | "drawer"
  onClose = () => {},
  onNavigateTab = () => {},
}) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [likedMap, setLikedMap] = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Execution function
  const executeQuery = async (queryText) => {
    const textToSend = queryText || question;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsgId = Date.now();
    const userMessage = {
      id: userMsgId,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      let res;
      if (typeof apiAskCopilot === "function") {
        res = await apiAskCopilot(textToSend.trim());
      } else {
        res = await axios.post("http://127.0.0.1:8000/api/copilot/", {
          question: textToSend.trim(),
        });
      }

      const answer =
        res?.data?.answer ||
        res?.data?.message ||
        "I processed your query, but received an empty response from the analytics engine.";

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        answer: answer,
        data: res?.data?.data || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Copilot request error:", err);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        isError: true,
        answer:
          "Unable to reach the ERP Copilot service. Please ensure the analytics backend is active on port 8000.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeQuery();
    }
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFeedback = (id, type) => {
    setLikedMap((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  };

  const handleClearChat = () => {
    setMessages([]);
    setQuestion("");
    textareaRef.current?.focus();
  };

  const quickChips = [
    "Who are my top customers?",
    "Show monthly revenue trend",
    "Any overdue invoices?",
    "How is inventory health?",
  ];

  const isDrawer = variant === "drawer";

  return (
    <div
      className={`flex flex-col bg-white overflow-hidden ${
        isDrawer
          ? "h-full w-full"
          : "h-[740px] rounded-2xl border border-slate-200/90 shadow-sm"
      }`}
    >
      {/* ================= HEADER ================= */}
      <div className="px-4 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-2xs">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                ERP Copilot
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Snowflake Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Natural language intelligence for enterprise metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {isDrawer && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Copilot"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* ================= CHAT HISTORY SCROLL AREA ================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 bg-slate-50/40">
        {messages.length === 0 ? (
          <EmptyState onSelectPrompt={executeQuery} />
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className="space-y-1">
                {msg.role === "user" ? (
                  // User Message
                  <div className="flex justify-end">
                    <div className="max-w-[85%] sm:max-w-lg bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-2xs text-xs sm:text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  // Assistant Message
                  <div className="flex items-start gap-2.5 max-w-full">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                      <Sparkles size={14} />
                    </div>

                    <div className="flex-1 min-w-0 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-2xs">
                      {/* Sub-header */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                          <span>DataPilot Copilot</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-normal text-slate-400">Gemini 2.5</span>
                        </div>
                        {msg.timestamp && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <MarkdownMessage content={msg.answer} />

                      {/* Snowflake Data Inspector */}
                      {msg.data && (
                        <DataInspector
                          data={msg.data}
                          onNavigateTab={onNavigateTab}
                        />
                      )}

                      {/* Action Bar */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyMessage(msg.answer, msg.id || idx)}
                            className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === (msg.id || idx) ? (
                              <>
                                <Check size={12} className="text-emerald-500" />
                                <span className="text-emerald-600 font-medium text-[10px]">
                                  Copied
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFeedback(msg.id || idx, "like")}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              likedMap[msg.id || idx] === "like"
                                ? "text-indigo-600 bg-indigo-50"
                                : "hover:bg-slate-100 hover:text-slate-700"
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => handleToggleFeedback(msg.id || idx, "dislike")}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              likedMap[msg.id || idx] === "dislike"
                                ? "text-rose-600 bg-rose-50"
                                : "hover:bg-slate-100 hover:text-slate-700"
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-2.5 max-w-full">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 animate-pulse shadow-2xs">
                  <Sparkles size={14} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Querying Snowflake warehouse & synthesizing insights...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ================= INPUT FOOTER AREA ================= */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2.5">
        {/* Quick follow-up chips when messages exist */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Suggestions:
            </span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => executeQuery(chip)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 text-[11px] text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="relative flex items-center">
          <input
            ref={textareaRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask a question (e.g., Who are my top customers?)..."
            className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 pr-12 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />

          <button
            onClick={() => executeQuery()}
            disabled={!question.trim() || loading}
            className={`absolute right-1.5 sm:right-2 p-2 rounded-lg transition-all flex items-center justify-center ${
              question.trim() && !loading
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            title="Send query (Enter)"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin text-slate-500" />
            ) : (
              <ArrowUp size={15} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Footnote */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1">
            <span>Direct Snowflake warehouse marts connection</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[9px] text-slate-600">
              Enter ↵
            </kbd>
            <span>to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}