// app/(dashboard)/[slug]/settings/integrations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Copy, Check, RefreshCw, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WhatsAppIntegration from "./WhatsAppIntegration";
import { useParams } from "next/navigation";
import Link from "next/link";

type Tab = "curl" | "javascript" | "html";

export default function IntegrationsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [apiKey, setApiKey] = useState("");
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>([]);
  const [originInput, setOriginInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("curl");
  const [plan, setPlan] = useState<string>("free");

  // Dialog state
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";
  const endpoint = apiKey ? `${baseUrl}/api/public/leads/${apiKey}` : "";

  useEffect(() => {
    fetch("/api/organization/api-key")
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || "Failed to load API key");
        }
        return r.json();
      })
      .then((d) => {
        setApiKey(d.apiKey);
        setAllowedOrigins(d.allowedOrigins || []);
        setPlan(d.plan || "free");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function copy(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/organization/api-key", { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setAlertDialog({
          title: "Couldn't regenerate key",
          description: d.error || "Something went wrong. Please try again.",
        });
        return;
      }
      const d = await res.json();
      setApiKey(d.apiKey);
      setRegenerateDialogOpen(false);
    } finally {
      setRegenerating(false);
    }
  }

  async function addOrigin() {
    if (!originInput) return;
    const next = [...allowedOrigins, originInput.trim()];
    setAllowedOrigins(next);
    setOriginInput("");
    await fetch("/api/organization/api-key", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowedOrigins: next }),
    });
  }

  async function removeOrigin(origin: string) {
    const next = allowedOrigins.filter((o) => o !== origin);
    setAllowedOrigins(next);
    await fetch("/api/organization/api-key", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowedOrigins: next }),
    });
  }

  const maskedKey = apiKey ? apiKey.slice(0, 12) + "•".repeat(20) : "";

  const curlSnippet = `curl -X POST ${endpoint || "ENDPOINT_URL"} \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "treatmentCategory": "Dermatology Consultation",
    "message": "I would like to book a consultation"
  }'`;

  const jsSnippet = `fetch("${endpoint || "ENDPOINT_URL"}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    treatmentCategory: "Dermatology Consultation",
    message: "I would like to book a consultation"
  })
})
  .then(res => res.json())
  .then(data => console.log(data));`;

  const htmlSnippet = `<form id="enquiry-form">
  <input name="firstName" placeholder="First name" required />
  <input name="lastName" placeholder="Last name" />
  <input name="email" type="email" placeholder="Email" required />
  <input name="phone" placeholder="Phone" required />
  <input name="treatmentCategory" placeholder="Treatment interested in" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById("enquiry-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const res = await fetch("${endpoint || "ENDPOINT_URL"}", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    alert("Thanks! We'll be in touch shortly.");
    form.reset();
  } else {
    alert("Something went wrong, please try again.");
  }
});
</script>`;

  const snippets: Record<Tab, string> = {
    curl: curlSnippet,
    javascript: jsSnippet,
    html: htmlSnippet,
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  if (error) {
    return (
      <div className="p-8 text-sm text-red-500">
        Couldn't load your integration settings: {error}. Try refreshing the
        page.
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage external connections and API credentials.
        </p>
      </div>

      <Tabs defaultValue="website" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="website">Website (API Keys)</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp (Meta)</TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="space-y-8 animate-in fade-in-50">
          <div>
            <h2 className="text-xl font-semibold">Website Integration</h2>
            <p className="text-sm text-gray-500 mt-1">
              Connect your website's enquiry form directly to your CRM leads inbox.
            </p>
          </div>

          <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-700">Endpoint</h2>
        <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
          <code className="text-sm flex-1 overflow-x-auto">
            POST {endpoint}
          </code>
          <button
            onClick={() => copy(endpoint, "endpoint")}
            className="text-gray-500 hover:text-gray-800"
          >
            {copiedField === "endpoint" ? (
              <Check size={16} />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-700">Your API key</h2>
        <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
          <code className="text-sm flex-1 overflow-x-auto">
            {showKey ? apiKey : maskedKey}
          </code>
          <button
            onClick={() => setShowKey((s) => !s)}
            className="text-gray-500 hover:text-gray-800"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={() => copy(apiKey, "key")}
            className="text-gray-500 hover:text-gray-800"
          >
            {copiedField === "key" ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            onClick={() => setRegenerateDialogOpen(true)}
            className="text-gray-500 hover:text-gray-800"
            title="Regenerate key"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400">
          This key is embedded in the endpoint URL above. It's safe to use in
          your public website code — it can only submit new leads, nothing else.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-700">Request body</h2>
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2">Field</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Required</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              ["firstName", "string", "Yes"],
              ["lastName", "string", "No"],
              ["email", "string", "Yes"],
              ["phone", "string", "Yes"],
              ["treatmentCategory", "string", "Yes"],
              ["message", "string", "Yes"],
            ].map(([f, t, r]) => (
              <tr key={f}>
                <td className="px-3 py-2 font-mono">{f}</td>
                <td className="px-3 py-2 text-gray-500">{t}</td>
                <td className="px-3 py-2 text-gray-500">{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-700">
          Sample integration
        </h2>
        <div className="flex gap-1 border-b">
          {(["curl", "javascript", "html"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm ${tab === t ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            >
              {t === "curl"
                ? "cURL"
                : t === "javascript"
                  ? "JavaScript"
                  : "HTML Form"}
            </button>
          ))}
        </div>
        <div className="relative bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
          <button
            onClick={() => copy(snippets[tab], tab)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            {copiedField === tab ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <pre className="whitespace-pre-wrap">{snippets[tab]}</pre>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-700">
          Allowed website domains{" "}
          <span className="text-gray-400">(optional)</span>
        </h2>
        <p className="text-xs text-gray-400">
          Leave empty to allow requests from any domain. Add your domains to
          restrict submissions to only your own website(s).
        </p>
        <div className="flex gap-2">
          <input
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            placeholder="https://yourclinic.com"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={addOrigin}
            className="px-3 py-2 bg-black text-white rounded-lg text-sm"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {allowedOrigins.map((o) => (
            <span
              key={o}
              className="flex items-center gap-1 bg-cyan-100 text-sm rounded-full px-3 py-1"
            >
              {o}
              <button
                onClick={() => removeOrigin(o)}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Regenerate confirmation dialog */}
      <Dialog
        open={regenerateDialogOpen}
        onOpenChange={setRegenerateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate API key?</DialogTitle>
            <DialogDescription>
              This will immediately invalidate your current key. Any website
              using the old key will stop being able to submit leads until you
              update it with the new one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegenerateDialogOpen(false)}
              disabled={regenerating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? "Regenerating…" : "Regenerate key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic error/alert dialog, replaces browser alert() */}
      <Dialog
        open={!!alertDialog}
        onOpenChange={(open) => !open && setAlertDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              {alertDialog?.title}
            </DialogTitle>
            <DialogDescription>{alertDialog?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setAlertDialog(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="whatsapp" className="animate-in fade-in-50 pt-2">
          {plan?.toLowerCase() === "pro" ? (
            <WhatsAppIntegration />
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center max-w-2xl mx-auto mt-8 shadow-sm">
              <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m12 10 4-4"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Upgrade to Pro</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Automated WhatsApp messaging is available exclusively on our Pro plan. Upgrade today to unlock direct patient communications, custom templates, and advanced Meta Cloud API features.
              </p>
              <Link href={`/${slug}/billing`}>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 rounded-xl h-12 shadow-md hover:shadow-lg transition-all">
                  View Pricing & Upgrade
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
