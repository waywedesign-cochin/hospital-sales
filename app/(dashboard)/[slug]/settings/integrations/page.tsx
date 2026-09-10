// app/(dashboard)/[slug]/settings/integrations/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  Plug,
} from "lucide-react";
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
type Category = { _id: string; name: string };

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
  const [categories, setCategories] = useState<Category[]>([]);

  // Dialog state
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://hospital-sales.vercel.app";
  const endpoint = apiKey ? `${baseUrl}/api/public/leads/${apiKey}` : "";

  useEffect(() => {
    async function loadData() {
      try {
        const [keyRes, catRes] = await Promise.all([
          axios.get("/api/organization/api-key"),
          axios
            .get("/api/treatment-category")
            .catch(() => ({ data: { data: [] } })),
        ]);

        setApiKey(keyRes.data.apiKey);
        setAllowedOrigins(keyRes.data.allowedOrigins || []);
        setPlan(keyRes.data.plan || "free");
        setCategories(catRes.data.data || catRes.data || []);
      } catch (err: any) {
        const message =
          err.response?.data?.error || err.message || "Failed to load API key";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function copy(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await axios.post("/api/organization/api-key");
      setApiKey(res.data.apiKey);
      setRegenerateDialogOpen(false);
    } catch (err: any) {
      setAlertDialog({
        title: "Couldn't regenerate key",
        description:
          err.response?.data?.error ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setRegenerating(false);
    }
  }

  async function addOrigin() {
    if (!originInput) return;
    const next = [...allowedOrigins, originInput.trim()];
    setAllowedOrigins(next);
    setOriginInput("");
    try {
      await axios.put("/api/organization/api-key", { allowedOrigins: next });
    } catch (err: any) {
      setAlertDialog({
        title: "Couldn't save domain",
        description:
          err.response?.data?.error ||
          "Something went wrong. Please try again.",
      });
      setAllowedOrigins((prev) => prev.filter((o) => o !== originInput.trim())); // revert on failure
    }
  }

  async function removeOrigin(origin: string) {
    const previous = allowedOrigins;
    const next = allowedOrigins.filter((o) => o !== origin);
    setAllowedOrigins(next);
    try {
      await axios.put("/api/organization/api-key", { allowedOrigins: next });
    } catch (err: any) {
      setAlertDialog({
        title: "Couldn't remove domain",
        description:
          err.response?.data?.error ||
          "Something went wrong. Please try again.",
      });
      setAllowedOrigins(previous); // revert on failure
    }
  }

  const maskedKey = apiKey ? apiKey.slice(0, 12) + "•".repeat(20) : "";
  const exampleCategory = categories[0]?.name || "Dermatology Consultation";

  const categoryOptions =
    categories.length > 0
      ? categories
          .map((c) => `    <option value="${c.name}">${c.name}</option>`)
          .join("\n")
      : `    <option value="General Consultation">General Consultation</option>`;

  const curlSnippet = `curl -X POST ${endpoint || "ENDPOINT_URL"} \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "treatmentCategory": "${exampleCategory}",
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
    treatmentCategory: "${exampleCategory}",
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
  <select name="treatmentCategory" required>
    <option value="" disabled selected>Select treatment</option>
${categoryOptions}
  </select>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-700">
            Loading integrations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-2">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 text-sm text-red-600">
          Couldn't load your integration settings: {error}. Try refreshing the
          page.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 space-y-6 relative">
      {/* Header */}
      <div className="relative z-10 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-[#0D1117] p-4 rounded-xl">
              <Plug className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Integrations
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Manage external connections and API credentials
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <Tabs defaultValue="website" className="w-full">
          <TabsList className="mb-6 bg-slate-100 rounded-xl p-1">
            <TabsTrigger
              value="website"
              className="rounded-lg data-[state=active]:bg-[#0D1117] data-[state=active]:text-white"
            >
              Website (API Keys)
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="rounded-lg data-[state=active]:bg-[#0D1117] data-[state=active]:text-white"
            >
              WhatsApp (Meta)
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="website"
            className="space-y-8 animate-in fade-in-50"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Website Integration
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Connect your website's enquiry form directly to your CRM leads
                inbox.
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Endpoint
              </h2>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <code className="text-sm flex-1 overflow-x-auto text-slate-700">
                  POST {endpoint}
                </code>
                <button
                  onClick={() => copy(endpoint, "endpoint")}
                  className="text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {copiedField === "endpoint" ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Your API key
              </h2>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <code className="text-sm flex-1 overflow-x-auto text-slate-700">
                  {showKey ? apiKey : maskedKey}
                </code>
                <button
                  onClick={() => setShowKey((s) => !s)}
                  className="text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copy(apiKey, "key")}
                  className="text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {copiedField === "key" ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <button
                  onClick={() => setRegenerateDialogOpen(true)}
                  className="text-slate-500 hover:text-amber-600 transition-colors"
                  title="Regenerate key"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                This key is embedded in the endpoint URL above. It's safe to use
                in your public website code — it can only submit new leads,
                nothing else.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Request body
              </h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#0D1117]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Required
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {[
                      ["firstName", "string", "Yes"],
                      ["lastName", "string", "No"],
                      ["email", "string", "Yes"],
                      ["phone", "string", "Yes"],
                      ["treatmentCategory", "string", "Yes"],
                      ["message", "string", "Yes"],
                    ].map(([f, t, r]) => (
                      <tr
                        key={f}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                          {f}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{t}</td>
                        <td className="px-4 py-3 text-slate-500">{r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Treatment categories
              </h2>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <AlertTriangle
                  size={16}
                  className="text-amber-600 mt-0.5 shrink-0"
                />
                <p className="text-xs text-amber-800">
                  Use one of the exact category names below in your form's{" "}
                  <code className="font-mono bg-amber-100 px-1 rounded">
                    treatmentCategory
                  </code>{" "}
                  field. Values outside this list will still be accepted, but
                  won't match your existing reports and filters correctly.
                </p>
              </div>

              {categories.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No treatment categories set up yet.{" "}
                  <Link
                    href={`/${slug}/settings/treatment-category`}
                    className="underline text-emerald-700 hover:text-emerald-800"
                  >
                    Add some here
                  </Link>{" "}
                  so your website form can use them.
                </p>
              ) : (
                <>
                  {/* Individual quick-copy chips — for grabbing one value at a time */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => copy(c.name, `cat-${c._id}`)}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-sm rounded-full px-3 py-1 transition-colors text-slate-700 font-medium"
                      >
                        {c.name}
                        {copiedField === `cat-${c._id}` ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} className="text-slate-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Copy-all block — for building a custom dropdown */}
                  <div className="relative bg-[#0D1117] text-slate-100 rounded-xl p-4 text-xs overflow-x-auto mt-3">
                    <button
                      onClick={() =>
                        copy(
                          categories
                            .map(
                              (c) =>
                                `<option value="${c.name}">${c.name}</option>`,
                            )
                            .join("\n"),
                          "cat-all",
                        )
                      }
                      className="absolute top-2 right-2 text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      {copiedField === "cat-all" ? (
                        <>
                          <Check size={14} />{" "}
                          <span className="text-[10px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />{" "}
                          <span className="text-[10px]">Copy all</span>
                        </>
                      )}
                    </button>
                    <pre className="whitespace-pre-wrap">
                      {categories
                        .map(
                          (c) => `<option value="${c.name}">${c.name}</option>`,
                        )
                        .join("\n")}
                    </pre>
                  </div>
                </>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sample integration
              </h2>
              <div className="flex gap-1 border-b border-slate-200">
                {(["curl", "javascript", "html"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-2 text-sm transition-colors ${
                      tab === t
                        ? "border-b-2 border-emerald-600 text-slate-900 font-semibold"
                        : "text-gray-500 hover:text-slate-700"
                    }`}
                  >
                    {t === "curl"
                      ? "cURL"
                      : t === "javascript"
                        ? "JavaScript"
                        : "HTML Form"}
                  </button>
                ))}
              </div>
              <div className="relative bg-[#0D1117] text-slate-100 rounded-xl p-4 text-xs overflow-x-auto">
                <button
                  onClick={() => copy(snippets[tab], tab)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {copiedField === tab ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <pre className="whitespace-pre-wrap">{snippets[tab]}</pre>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Allowed website domains{" "}
                <span className="text-gray-400 normal-case font-normal">
                  (optional)
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Leave empty to allow requests from any domain. Add your domains
                to restrict submissions to only your own website(s).
              </p>
              <div className="flex gap-2">
                <input
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  placeholder="https://yourclinic.com"
                  className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                />
                <Button
                  onClick={addOrigin}
                  className="h-11 px-4 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {allowedOrigins.map((o) => (
                  <span
                    key={o}
                    className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm rounded-full px-3 py-1 font-medium"
                  >
                    {o}
                    <button
                      onClick={() => removeOrigin(o)}
                      className="text-emerald-400 hover:text-red-500 transition-colors"
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
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">
                    Regenerate API key?
                  </DialogTitle>
                  <DialogDescription>
                    This will immediately invalidate your current key. Any
                    website using the old key will stop being able to submit
                    leads until you update it with the new one.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setRegenerateDialogOpen(false)}
                    disabled={regenerating}
                    className="rounded-xl font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    {regenerating ? "Regenerating…" : "Regenerate key"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Generic error/alert dialog */}
            <Dialog
              open={!!alertDialog}
              onOpenChange={(open) => !open && setAlertDialog(null)}
            >
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-slate-900">
                    <AlertCircle className="text-red-500" size={18} />
                    {alertDialog?.title}
                  </DialogTitle>
                  <DialogDescription>
                    {alertDialog?.description}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    onClick={() => setAlertDialog(null)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    OK
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="whatsapp" className="animate-in fade-in-50 pt-2">
            {plan?.toLowerCase() === "pro" ? (
              <WhatsAppIntegration />
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-2xl mx-auto mt-4 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-[#0D1117] text-emerald-400 rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 14 4-4" />
                    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    <path d="m12 10 4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Upgrade to Pro
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Automated WhatsApp messaging is available exclusively on our
                  Pro plan. Upgrade today to unlock direct patient
                  communications, custom templates, and advanced Meta Cloud API
                  features.
                </p>
                <Link href={`/${slug}/billing`}>
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 rounded-xl h-12 shadow-md transition-all"
                  >
                    View Pricing & Upgrade
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
