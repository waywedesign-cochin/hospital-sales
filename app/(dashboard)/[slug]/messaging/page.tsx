"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Send, Users, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function MessagingPage() {
  const params = useParams();
  const slug = params.slug as string;
  // Form State
  const [audienceType, setAudienceType] = useState("broadcast");
  const [patientId, setPatientId] = useState("");
  const [tone, setTone] = useState("Professional");
  const [prompt, setPrompt] = useState("");
  
  // App State
  const [patients, setPatients] = useState<any[]>([]);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Patients and Plan
  useEffect(() => {
    const init = async () => {
      try {
        const [patientsRes, planRes] = await Promise.all([
          axios.get("/api/patients?limit=50").catch(() => null),
          fetch("/api/organization/api-key").then(res => res.json()).catch(() => ({}))
        ]);
        
        if (patientsRes?.data?.success) {
          setPatients(patientsRes.data.data.patients);
        }
        setPlan(planRes.plan || "free");
      } catch (error) {
        console.error("Failed to initialize messaging page", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

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
        patientId
      });
      
      if (res.data.success) {
        setGeneratedMessage(res.data.message);
        toast.success("Message generated successfully!");
      } else {
        toast.error("Failed to generate message");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during AI generation");
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
        messageType: "CAMPAIGN"
      });

      if (res.data.success) {
        toast.success(`Message sent! Logged ${res.data.data.length} records.`);
        setGeneratedMessage("");
        setPrompt("");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during dispatch");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading messaging center...</div>;
  }

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
                <Select value={audienceType} onValueChange={setAudienceType}>
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
                  </SelectContent>
                </Select>
              </div>

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
              disabled={isGenerating}
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
