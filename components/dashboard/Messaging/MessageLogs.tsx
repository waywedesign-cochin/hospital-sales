"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CheckCheck,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import PatientChatPanel from "./PatientChatPanel";

interface LogEntry {
  _id: string;
  batchId?: string;
  groupKey?: string;
  sentAt?: string;
  createdAt: string;
  messageType: string;
  content: string;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  firstStatus: string;
  firstErrorDetails?: string;
  firstRecipientPhone: string;
  firstPatientId?: string;
  patientDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export default function MessageLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat panel state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/whatsapp/logs?limit=50");
      if (res.data.success) {
        setLogs(res.data.data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const openChat = (log: LogEntry) => {
    setSelectedLog(log);
    setChatOpen(true);
  };

  const getStatusBadge = (log: LogEntry) => {
    if (log.totalCount > 1) {
      if (log.failedCount > 0) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" /> {log.sentCount} Sent, {log.failedCount} Failed
          </span>
        );
      } else if (log.sentCount === 0 && log.totalCount > 0) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3" /> Queued ({log.totalCount})
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" /> Sent to {log.totalCount}
          </span>
        );
      }
    }

    const status = log.firstStatus || "PENDING";
    const errorDetails = log.firstErrorDetails;

    switch (status) {
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" /> Sent
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            <CheckCheck className="w-3 h-3" /> Delivered
          </span>
        );
      case "READ":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCheck className="w-3 h-3 text-green-500" /> Read
          </span>
        );
      case "FAILED":
        return (
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
            title={errorDetails || "Message failed"}
          >
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  // Resolve name and phone from selected log
  const chatPatientName = selectedLog
    ? selectedLog.patientDetails
      ? `${selectedLog.patientDetails.firstName} ${selectedLog.patientDetails.lastName}`.trim()
      : "Unknown Patient"
    : "";
  const chatPhone = selectedLog?.firstRecipientPhone || "";
  const chatPatientId = selectedLog?.patientDetails?._id || selectedLog?.firstPatientId;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800">Recent Messages</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any row to open the full conversation</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLogs} 
            disabled={loading}
            className="h-8 text-slate-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="max-w-[300px]">Content</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No messages sent yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log._id}
                    className="cursor-pointer hover:bg-green-50/40 transition-colors group"
                    onClick={() => openChat(log)}
                  >
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {new Date(log.sentAt || log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">
                          {log.patientDetails ? `${log.patientDetails.firstName} ${log.patientDetails.lastName}` : 'Unknown Patient'}
                          {log.totalCount > 1 ? ` + ${log.totalCount - 1} others` : ''}
                        </span>
                        <span className="text-xs text-slate-500">
                          {log.totalCount > 1 ? 'Bulk Broadcast' : log.firstRecipientPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {log.messageType?.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-slate-600" title={log.content}>
                      {log.content}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(log)}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-green-500 transition-colors" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Chat Panel */}
      <PatientChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        patientId={chatPatientId}
        patientName={chatPatientName}
        phone={chatPhone}
        batchId={selectedLog?.batchId}
        groupKey={selectedLog?.groupKey}
        totalCount={selectedLog?.totalCount}
      />
    </>
  );
}
