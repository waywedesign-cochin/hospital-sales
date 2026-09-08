"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  X,
  Send,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  MessageCircle,
  Phone,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface ChatMessage {
  _id: string;
  content: string;
  status: "PENDING" | "SENT" | "FAILED" | "DELIVERED" | "READ";
  messageType: string;
  sentAt?: string;
  createdAt: string;
  errorDetails?: string;
  recipientPhone?: string;
  patientId?: { _id: string; firstName: string; lastName: string; phone: string } | string;
}

interface PatientChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  patientName: string;
  phone: string;
  batchId?: string | null;
  groupKey?: string | null;
  totalCount?: number;
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const formatDate = (d: string) => {
  const dt = new Date(d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dt.toDateString() === today.toDateString()) return "Today";
  if (dt.toDateString() === yesterday.toDateString()) return "Yesterday";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const typeBadge: Record<string, string> = {
  CAMPAIGN:             "bg-purple-100 text-purple-600",
  REMINDER:             "bg-amber-100 text-amber-600",
  BOOKING_CONFIRMATION: "bg-blue-100 text-blue-600",
  MANUAL:               "bg-slate-100 text-slate-500",
};

function StatusTick({ status, errorDetails }: { status: string; errorDetails?: string }) {
  switch (status) {
    case "SENT":      return <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    case "DELIVERED": return <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    case "READ":      return <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    case "FAILED":    return (
      <span title={errorDetails || "Failed"} className="shrink-0">
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      </span>
    );
    default:          return <Clock className="w-3.5 h-3.5 text-slate-300 animate-pulse shrink-0" />;
  }
}

function RecipientStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    SENT:      "bg-blue-50  text-blue-600  border-blue-100",
    DELIVERED: "bg-slate-50 text-slate-600 border-slate-200",
    READ:      "bg-green-50 text-green-600 border-green-100",
    FAILED:    "bg-red-50   text-red-600   border-red-100",
    PENDING:   "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

/* ─── component ───────────────────────────────────────────────────────────── */
export default function PatientChatPanel({
  isOpen, onClose, patientId, patientName, phone, batchId, groupKey, totalCount,
}: PatientChatPanelProps) {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [mode,     setMode]       = useState<"individual" | "group">("individual");
  const [loading,  setLoading]    = useState(false);
  const [text,     setText]       = useState("");
  const [sending,  setSending]    = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const isGroup = (!!batchId || !!groupKey) && (totalCount ?? 0) > 1;

  /* fetch */
  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = "";
      if (isGroup && batchId)    url = `/api/whatsapp/chat?batchId=${encodeURIComponent(batchId)}`;
      else if (isGroup && groupKey) url = `/api/whatsapp/chat?groupKey=${encodeURIComponent(groupKey)}`;
      else if (patientId)        url = `/api/whatsapp/chat?patientId=${patientId}`;
      else if (phone)            url = `/api/whatsapp/chat?phone=${encodeURIComponent(phone)}`;
      if (!url) return;
      const res = await axios.get(url);
      if (res.data.success) {
        setMessages(res.data.data);
        setMode(res.data.mode ?? "individual");
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) { setMessages([]); setText(""); fetchHistory(); }
  }, [isOpen, patientId, phone, batchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* send (individual only) */
  const handleSend = async () => {
    if (!text.trim() || sending || isGroup) return;
    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`, content: text.trim(),
      status: "PENDING", messageType: "MANUAL", createdAt: new Date().toISOString(),
    };
    setMessages(p => [...p, optimistic]);
    const msg = text.trim();
    setText("");
    setSending(true);
    try {
      await axios.post("/api/whatsapp/manual-send", { patientId, phone, message: msg });
      setMessages(p =>
        p.map(m => m._id === optimistic._id ? { ...m, status: "SENT", sentAt: new Date().toISOString() } : m)
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to send");
      setMessages(p => p.map(m => m._id === optimistic._id ? { ...m, status: "FAILED" } : m));
    } finally { setSending(false); inputRef.current?.focus(); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* grouped messages by date (individual mode) */
  const grouped: { date: string; msgs: ChatMessage[] }[] = [];
  if (mode === "individual") {
    messages.forEach(msg => {
      const date = formatDate(msg.sentAt ?? msg.createdAt);
      const last = grouped[grouped.length - 1];
      if (last?.date === date) last.msgs.push(msg);
      else grouped.push({ date, msgs: [msg] });
    });
  }

  /* group-mode stats */
  const sentCount   = messages.filter(m => ["SENT","DELIVERED","READ"].includes(m.status)).length;
  const failedCount = messages.filter(m => m.status === "FAILED").length;
  const broadcastContent  = messages[0]?.content   ?? "";
  const broadcastType     = messages[0]?.messageType ?? "CAMPAIGN";
  const broadcastDate     = messages[0] ? formatDate(messages[0].sentAt ?? messages[0].createdAt) : "";
  const broadcastTime     = messages[0] ? formatTime(messages[0].sentAt ?? messages[0].createdAt) : "";

  const headerLabel = isGroup
    ? `${patientName}${(totalCount ?? 0) > 1 ? ` + ${(totalCount ?? 1) - 1} others` : ""}`
    : patientName;

  /* ─── render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── header ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] text-white shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shrink-0">
            {isGroup ? <Users className="w-5 h-5" /> : patientName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white leading-tight truncate">{headerLabel}</p>
            {isGroup ? (
              <p className="text-xs text-green-100 mt-0.5">
                {sentCount} sent · {failedCount > 0 ? `${failedCount} failed · ` : ""}Campaign broadcast
              </p>
            ) : (
              <p className="text-xs text-green-100 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />{phone}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── chat area ── */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{
            background: "#efeae2",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5ccbb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="text-sm">Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center shadow-sm">
                <MessageCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No messages yet</p>
            </div>

          /* ── GROUP MODE ── */
          ) : isGroup ? (
            <div className="space-y-4">
              {/* date separator */}
              <div className="flex justify-center">
                <span className="bg-white/80 text-slate-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                  {broadcastDate}
                </span>
              </div>

              {/* single message bubble */}
              <div className="flex justify-end">
                <div className="max-w-[88%] bg-[#d9fdd3] rounded-xl rounded-tr-sm px-3 py-2.5 shadow-sm">
                  <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mb-1.5 ${typeBadge[broadcastType] ?? "bg-slate-100 text-slate-500"}`}>
                    {broadcastType.replace("_", " ")}
                  </span>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {broadcastContent}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-slate-400">{broadcastTime}</span>
                  </div>
                </div>
              </div>

              {/* ── Delivery receipts card ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    {messages.length} recipients
                  </span>
                  <span className="ml-auto text-xs text-slate-400">
                    {sentCount} sent · {failedCount} failed
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {messages.map(msg => {
                    const p = typeof msg.patientId === "object" ? msg.patientId : null;
                    const name = p
                      ? `${p.firstName} ${p.lastName}`.trim()
                      : msg.recipientPhone ?? "Unknown";
                    const sub = p?.phone ?? msg.recipientPhone ?? "";
                    return (
                      <div key={msg._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                          {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <RecipientStatusPill status={msg.status} />
                          <StatusTick status={msg.status} errorDetails={msg.errorDetails} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center">
                <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[11px] px-3 py-1.5 rounded-lg text-center max-w-xs">
                  Broadcast campaign · To reply to a specific patient, open their profile.
                </span>
              </div>
            </div>

          /* ── INDIVIDUAL MODE ── */
          ) : (
            grouped.map(({ date, msgs }) => (
              <div key={date} className="mb-1">
                <div className="flex justify-center my-3">
                  <span className="bg-white/80 text-slate-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                    {date}
                  </span>
                </div>
                {msgs.map(msg => (
                  <div key={msg._id} className="flex justify-end mb-1.5">
                    <div className="max-w-[82%] bg-[#d9fdd3] rounded-xl rounded-tr-sm px-3 py-2 shadow-sm">
                      {msg.messageType !== "MANUAL" && (
                        <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mb-1 ${typeBadge[msg.messageType] ?? "bg-slate-100 text-slate-500"}`}>
                          {msg.messageType.replace("_", " ")}
                        </span>
                      )}
                      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.status === "FAILED" && msg.errorDetails && (
                        <p className="text-[11px] text-red-500 mt-1 bg-red-50 rounded px-2 py-0.5">
                          ⚠ {msg.errorDetails}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-slate-400">{formatTime(msg.sentAt ?? msg.createdAt)}</span>
                        <StatusTick status={msg.status} errorDetails={msg.errorDetails} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── input (individual only) ── */}
        {!isGroup && (
          <>
            <div className="shrink-0 px-3 py-3 bg-[#f0f2f5] border-t border-slate-200 flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message…"
                className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded-2xl border-0 bg-white shadow-sm text-sm focus-visible:ring-1 focus-visible:ring-green-300 px-4 py-3"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-11 h-11 rounded-full p-0 bg-[#00a884] hover:bg-[#00916e] text-white shadow-md shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="shrink-0 px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-700">
                Free-text works within 24 hrs of patient's last reply. Otherwise use a template.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

