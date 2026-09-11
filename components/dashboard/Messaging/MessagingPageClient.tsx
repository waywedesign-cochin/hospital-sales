"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Send, Users, User, CheckCircle2, AlertCircle, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessageLogs from "@/components/dashboard/Messaging/MessageLogs";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import { getBirthdayPatientsAction } from "@/app/actions/patientActions";

export default function MessagingPageClient({
  initialPatients,
  plan,
}: {
  initialPatients: any[];
  plan: string;
}) {
  const params = useParams();
  const slug = params.slug as string;
  const user = useAuthStore((state) => state.user);
  const isDoctor = user?.role === "DOCTOR";
  // Form State
  const [audienceType, setAudienceType] = useState("broadcast");
  const [patientId, setPatientId] = useState("");
  const [tone, setTone] = useState("Professional");
  const [prompt, setPrompt] = useState("");
  const [templateName, setTemplateName] = useState("general_update");

  // App State
  const [patients] = useState<any[]>(initialPatients);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Birthday audience: fetched on demand (not part of initialPatients, which
  // is capped at 50 and only meant for the "Specific Patient" picker).
  const [birthdayPatients, setBirthdayPatients] = useState<any[]>([]);
  const [birthdayLoading, setBirthdayLoading] = useState(false);

  // Queue State
  const [queueStatus, setQueueStatus] = useState({ pendingCount: 0, completedCount: 0, failedCount: 0 });
  const [isPollingQueue, setIsPollingQueue] = useState(false);

  // Fetch Queue Status
  const fetchQueueStatus = async () => {
    try {
      const res = await axios.get("/api/whatsapp/queue-status");
      if (res.data.success) {
        setQueueStatus(res.data.data);
        if (res.data.data.pendingCount > 0) {
          setIsPollingQueue(true);
        } else {
          setIsPollingQueue(false);
        }
      }
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 401 || status === 400) {
        // Session expired/missing mid-poll — expected once a token lapses, not
        // a real failure. Stop polling instead of retrying every 3s forever;
        // the dashboard layout already redirects to /auth on the next navigation.
        setIsPollingQueue(false);
        return;
      }
      console.error("Failed to fetch queue status", e.response?.data || e.message);
    }
  };

  useEffect(() => {
    if (isDoctor) return;
    fetchQueueStatus();
  }, [isDoctor]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPollingQueue && !isDoctor) {
      interval = setInterval(fetchQueueStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [isPollingQueue, isDoctor]);

  useEffect(() => {
    if (audienceType !== "birthday") return;

    let cancelled = false;
    setBirthdayLoading(true);

    getBirthdayPatientsAction()
      .then((res) => {
        if (cancelled) return;
        setBirthdayPatients(res?.data?.patients ?? []);
      })
      .finally(() => {
        if (!cancelled) setBirthdayLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [audienceType]);

  const handleAudienceChange = (value: string) => {
    setAudienceType(value);
    if (value === "birthday") {
      setTemplateName("birthday_wish");
      setPrompt((prev) => prev || "Wish them a very happy birthday");
    }
  };

  const handleGenerateAI = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt for the AI");
      return;
    }
    if (audienceType === "specific" && !patientId) {
      toast.error("Please select a patient first");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await axios.post("/api/ai/generate-message", {
        prompt,
        tone,
        audienceType,
        patientId,
        templateName
      });

      if (res.data.success) {
        setGeneratedMessage(res.data.message);
        toast.success("Message generated successfully!");
      } else {
        toast.error("Failed to generate message");
      }
    } catch (error) {
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
          "An error occurred during AI generation",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!generatedMessage) {
      toast.error("Cannot send an empty message");
      return;
    }

    setIsSending(true);
    try {
      const res = await axios.post("/api/whatsapp/send", {
        messageContent: generatedMessage,
        audienceType,
        patientId,
        messageType: "CAMPAIGN",
        templateName
      });

      if (res.data.success) {
        toast.success(res.data.message || "Messages queued for dispatch!");
        setGeneratedMessage("");
        setPrompt("");
        fetchQueueStatus();
      } else {
        toast.error(res.data.message || "Failed to queue messages");
      }
    } catch (error) {
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
          "An error occurred during dispatch",
      );
    } finally {
      setIsSending(false);
    }
  };

  if (plan?.toLowerCase() !== "pro") {
    return (
      <div className="mx-auto p-6 space-y-8 flex items-center justify-center min-h-[70vh]">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-sm">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-primary rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Upgrade to Pro</h3>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The AI Messaging & WhatsApp Campaign center is available exclusively on our Pro plan. Upgrade today to unlock direct patient communications, AI-generated content, and bulk WhatsApp broadcasts.
          </p>
          <Link href={`/${slug}/billing`}>
            <Button size="lg" className="bg-blue-primary hover:bg-blue-600 text-white font-medium px-8 rounded-xl h-12 shadow-md hover:shadow-lg transition-all">
              View Pricing & Upgrade
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isDoctor) {
    return (
      <div className="mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="text-blue-primary" />
            Messaging
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View WhatsApp conversations with patients.
          </p>
        </div>
        <MessageLogs readOnly />
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Send className="text-blue-primary" />
          Messaging & Campaigns
          <span className="px-2 py-0.5 ml-2 inline-flex text-[10px] leading-4 font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white uppercase tracking-wider shadow-sm">
            PRO
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Draft highly personalized WhatsApp messages and campaigns using Google Gemini AI.
        </p>
      </div>

      {(queueStatus.pendingCount > 0 || queueStatus.completedCount > 0) && (
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              {queueStatus.pendingCount > 0 ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                {queueStatus.pendingCount > 0 ? "Dispatching Campaign..." : "Campaign Completed"}
              </h3>
              <p className="text-xs text-slate-500">
                Messages sent in the background to avoid timeouts.
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-slate-700">{queueStatus.pendingCount}</div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-emerald-600">{queueStatus.completedCount}</div>
              <div className="text-xs text-slate-400">Sent</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-500">{queueStatus.failedCount}</div>
              <div className="text-xs text-slate-400">Failed</div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="composer" className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-slate-100 border border-slate-200">
            <TabsTrigger value="composer" className="data-[state=active]:bg-white data-[state=active]:text-blue-primary data-[state=active]:shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Composer
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-white data-[state=active]:text-blue-primary data-[state=active]:shadow-sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Message Logs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="composer" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Composer */}
        <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl pb-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-accent bg-slate-800 p-0.5 rounded-md" />
              AI Message Composer
            </CardTitle>
            <CardDescription className="text-slate-500">
              Set the context and let AI write the perfect message for your patients.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Audience</label>
                <Select value={audienceType} onValueChange={handleAudienceChange}>
                  <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broadcast">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-slate-400" /> Broadcast to All Patients
                      </div>
                    </SelectItem>
                    <SelectItem value="specific">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-slate-400" /> Specific Patient
                      </div>
                    </SelectItem>
                    <SelectItem value="birthday">
                      <div className="flex items-center">
                        <Cake className="w-4 h-4 mr-2 text-slate-400" /> Patients with Birthday Today
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audienceType === "birthday" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {birthdayLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      Checking today&apos;s birthdays...
                    </div>
                  ) : birthdayPatients.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <Cake className="w-4 h-4 text-slate-400 shrink-0" />
                      No patients have a birthday today.
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <Cake className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        <span className="font-semibold">
                          {birthdayPatients.length} patient{birthdayPatients.length > 1 ? "s" : ""}
                        </span>{" "}
                        celebrating today: {birthdayPatients.map((p) => p.firstName).join(", ")}.
                        The message will be sent generically, without naming anyone.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {audienceType === "specific" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700">Select Patient</label>
                  <Select value={patientId} onValueChange={setPatientId}>
                    <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Search patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.firstName} {p.lastName} - {p.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">WhatsApp Template</label>
                <Select value={templateName} onValueChange={setTemplateName}>
                  <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_update">General Update (Recommended)</SelectItem>
                    <SelectItem value="festive_greeting">Festive Greeting</SelectItem>
                    <SelectItem value="birthday_wish">Birthday Wish</SelectItem>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Message Tone</label>
                <div className="flex flex-wrap gap-2">
                  {["Professional", "Friendly", "Urgent", "Festive", "Empathetic"].map(t => (
                    <div
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                        tone === t
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-semibold text-slate-700">What is the message about?</label>
                <Textarea
                  placeholder="E.g. Remind them about the upcoming clinic closure for Diwali..."
                  className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 resize-none focus-visible:ring-blue-100"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full rounded-xl bg-blue-primary hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 py-6"
              onClick={handleGenerateAI}
              disabled={
                isGenerating ||
                (audienceType === "birthday" && !birthdayLoading && birthdayPatients.length === 0)
              }
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" /> Generating Magic...
                </span>
              ) : (
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-neon-accent" /> Generate with Gemini
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: Preview & Send */}
        <div className="flex flex-col gap-6">
          <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl flex-1 flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl pb-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Send className="w-5 h-5 text-green-600" />
                Review & Dispatch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col flex-1 gap-4">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-700 mb-2">Final Message</label>
                <Textarea
                  placeholder="Your generated message will appear here. You can manually edit it before sending."
                  className="flex-1 min-h-[250px] rounded-xl border-slate-200 focus-visible:ring-blue-100 p-4 text-slate-700 leading-relaxed bg-white"
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                />
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold">WhatsApp Dispatch Ready</p>
                  <p className="text-green-700/80 mt-1">
                    Clicking send will dispatch this message via the official WhatsApp API. Please review the contents carefully.
                  </p>
                </div>
              </div>

              <Button
                className="w-full rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm shadow-green-500/20 py-6 text-lg font-semibold"
                onClick={handleSendMessage}
                disabled={isSending || !generatedMessage}
              >
                {isSending ? "Dispatching..." : "Send via WhatsApp"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </TabsContent>

      <TabsContent value="logs" className="mt-0 outline-none">
        <MessageLogs />
      </TabsContent>
    </Tabs>
    </div>
  );
}
