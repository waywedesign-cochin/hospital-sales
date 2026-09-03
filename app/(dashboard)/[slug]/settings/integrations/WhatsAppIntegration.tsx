"use client";

import { useState, useEffect } from "react";
import { Loader2, Key, Phone, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export default function WhatsAppIntegration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const [formData, setFormData] = useState({
    wabaId: "",
    phoneNumberId: "",
    accessToken: "",
  });

  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organization/whatsapp");
      if (!res.ok) {
        throw new Error("Failed to load WhatsApp config");
      }
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
        setFormData({
          wabaId: data.data.wabaId || "",
          phoneNumberId: data.data.phoneNumberId || "",
          accessToken: "",
        });
      } else {
        setConfig(null);
      }
    } catch (error) {
      toast.error("Failed to load WhatsApp config");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.wabaId || !formData.phoneNumberId || (!formData.accessToken && !config)) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);

      const payload: any = {
        wabaId: formData.wabaId,
        phoneNumberId: formData.phoneNumberId,
      };

      if (formData.accessToken) {
        payload.accessToken = formData.accessToken;
      }

      const res = await fetch("/api/organization/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("WhatsApp credentials saved securely!");
        fetchConfig();
      } else {
        toast.error(data.message || "Failed to save configuration");
      }
    } catch (error: any) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-gray-500 flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading WhatsApp Settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          WhatsApp Business API Integration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your Meta WhatsApp Business account to send automated appointment confirmations and reminders to your patients.
        </p>
        <Button variant="link" className="px-0 text-emerald-600 h-auto mt-2" onClick={() => setGuideOpen(true)}>
          Need help? Read the setup guide here.
        </Button>
      </div>

      {config?.isActive && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600" />
          <div>
            <h4 className="font-semibold text-sm">WhatsApp Active</h4>
            <p className="text-xs opacity-90 mt-1">
              Connected on {new Date(config.connectedAt).toLocaleDateString()}
            </p>
            {config.templateStatus && (
              <div className="mt-2 text-xs font-medium">
                Template Status: <span className="uppercase text-emerald-600">{config.templateStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 bg-white border rounded-xl p-6">
        <div className="grid gap-2">
          <Label htmlFor="wabaId">WhatsApp Business Account ID (WABA ID)</Label>
          <Input
            id="wabaId"
            value={formData.wabaId}
            onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })}
            placeholder="e.g. 100239281723"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phoneNumberId">Phone Number ID</Label>
          <Input
            id="phoneNumberId"
            value={formData.phoneNumberId}
            onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
            placeholder="e.g. 100983271234"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="token">Permanent Access Token</Label>
          <Input
            id="token"
            type="password"
            value={formData.accessToken}
            onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
            placeholder={config ? "Leave blank to keep existing encrypted token" : "EAA..."}
          />
          <p className="text-xs text-gray-500">
            We encrypt this token using AES-256-GCM before saving it. We never store it in plain text.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Credentials
          </Button>
        </div>
      </div>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Complete WhatsApp Business API Setup Guide</DialogTitle>
            <DialogDescription>Follow every step below carefully. The entire process typically takes 2–5 business days due to Meta&apos;s verification reviews.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6 text-sm text-gray-700">

            {/* ── STEP 1 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">1</span>
                Create a Meta Business Account (Portfolio)
              </h3>
              <p>A Meta Business Account (now called a &quot;Business Portfolio&quot;) proves to Meta that your hospital is a real, registered business. This is free.</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Go to <a href="https://business.facebook.com/overview" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">business.facebook.com/overview</a></li>
                <li>Log in with any personal Facebook account (this will become the admin).</li>
                <li>Click <strong>&quot;Create a Business Portfolio&quot;</strong> (previously called &quot;Create Account&quot;).</li>
                <li>Enter your hospital&apos;s legal name, your name, and your work email.</li>
                <li>Confirm the email verification link Meta sends you.</li>
              </ol>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>⏱ Time:</strong> Instant — you can proceed immediately after creating it.
              </div>
            </div>

            {/* ── STEP 2 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">2</span>
                Verify Your Business with Meta
              </h3>
              <p>Meta requires official documents to verify your hospital is legitimate. Without this, you&apos;re limited to sending messages only to test numbers.</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Go to <a href="https://business.facebook.com/settings/security" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">Business Settings → Security Center</a></li>
                <li>Click <strong>&quot;Start Verification&quot;</strong>.</li>
                <li>Enter your hospital&apos;s legal name, address, phone number, and website URL.</li>
                <li>Upload one of the following documents:
                  <ul className="list-disc ml-5 mt-1">
                    <li>Business registration certificate / Trade license</li>
                    <li>Utility bill (electricity, water, phone) showing hospital name &amp; address</li>
                    <li>Bank statement showing hospital name</li>
                    <li>Tax registration certificate (GST certificate for India)</li>
                  </ul>
                </li>
                <li>Choose a verification method: Meta will either call/text the phone number listed on official records, or send a verification email to an email address on your official domain.</li>
                <li>Enter the verification code you receive.</li>
              </ol>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>⏱ Time:</strong> Verification review takes <strong>1–3 business days</strong>. You&apos;ll get an email and a notification in Security Center when it&apos;s approved. If rejected, Meta will tell you why — usually a document mismatch — and you can resubmit.
              </div>
            </div>

            {/* ── STEP 3 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">3</span>
                Add a Payment Method (Credit/Debit Card) for WhatsApp Billing
              </h3>
              <p>Meta charges per conversation (not per message). The first 1,000 service conversations per month are <strong>free</strong>. After that, pricing varies by country (India: ~₹0.30–₹0.70 per conversation). You must add a payment method before you can send messages to real patients.</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Go to <a href="https://business.facebook.com/billing_hub/payment_methods" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">Business Settings → Billing &amp; Payments → Payment Methods</a></li>
                <li>Click <strong>&quot;Add Payment Method&quot;</strong>.</li>
                <li>Enter your credit card or debit card details (Visa, Mastercard, or RuPay are accepted for India).</li>
                <li>Set this card as the <strong>Primary payment method</strong>.</li>
                <li>Then go to <a href="https://business.facebook.com/billing_hub/accounts" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">Billing &amp; Payments → Accounts</a> and make sure your WhatsApp Business Account is linked to this payment method.</li>
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <strong>💡 Pricing Info:</strong> See full pricing at <a href="https://developers.facebook.com/docs/whatsapp/pricing" target="_blank" rel="noreferrer" className="underline">developers.facebook.com/docs/whatsapp/pricing</a>. You are billed monthly for conversations beyond the free tier.
              </div>
            </div>

            {/* ── STEP 4 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">4</span>
                Create a WhatsApp App in Meta Developer Dashboard
              </h3>
              <p>This &quot;App&quot; is a technical container that connects your hospital to the WhatsApp Cloud API. You only need to do this once.</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">developers.facebook.com/apps</a></li>
                <li>If prompted, register as a Meta developer (just agree to the terms).</li>
                <li>Click <strong>&quot;Create App&quot;</strong>.</li>
                <li>Select <strong>&quot;Other&quot;</strong> as the use case, then select <strong>&quot;Business&quot;</strong> as the app type.</li>
                <li>Name it something clear, e.g. <em>&quot;[Hospital Name] Patient Notifications&quot;</em>.</li>
                <li>Link it to the Business Portfolio you created in Step 1.</li>
                <li>Once the App is created, scroll down to <strong>&quot;Add products to your app&quot;</strong> and click <strong>&quot;Set up&quot;</strong> on the <strong>WhatsApp</strong> card.</li>
              </ol>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>⏱ Time:</strong> Instant — no review needed.
              </div>
            </div>

            {/* ── STEP 5 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">5</span>
                Add &amp; Verify Your Hospital&apos;s Phone Number
              </h3>
              <p>This is the phone number patients will see messages from (e.g. &quot;+91 98765 43210&quot;).</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 mb-2">
                <strong>⚠️ Important:</strong> This number must <strong>NOT</strong> be currently logged into any personal WhatsApp or WhatsApp Business mobile app. If it is, you must first open WhatsApp on that phone → Settings → Account → <strong>Delete my account</strong> (this removes it from WhatsApp&apos;s mobile system so it can be used with the API instead). You can use a new SIM card or a landline number to avoid this.
              </div>
              <ol className="list-decimal ml-5 space-y-1">
                <li>In your Meta App dashboard, go to <strong>WhatsApp → API Setup</strong> in the left sidebar.</li>
                <li>Scroll down to <strong>&quot;Step 5: Add a phone number&quot;</strong> and click the button.</li>
                <li>Enter your hospital&apos;s <strong>WhatsApp Business Display Name</strong> — this is the name patients will see (e.g. &quot;Sreerag Arogyakendaram&quot;). This must match or closely relate to your verified business name.</li>
                <li>Select your business category: <strong>&quot;Medical &amp; Health&quot;</strong>.</li>
                <li>Add a short business description (e.g. &quot;Multi-speciality hospital providing quality healthcare services&quot;).</li>
                <li>Enter the phone number and choose a verification method: <strong>Text message (SMS)</strong> or <strong>Phone call</strong>.</li>
                <li>Enter the 6-digit verification code.</li>
              </ol>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>⏱ Time:</strong> Phone verification is instant. However, your <strong>Display Name</strong> goes through a separate review by Meta which takes <strong>up to 24 hours</strong>. Until approved, messages will show a generic name. You&apos;ll be notified when it&apos;s approved.
              </div>
            </div>

            {/* ── STEP 6 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">6</span>
                Copy Your Phone Number ID &amp; WABA ID
              </h3>
              <p>These two IDs are what our system needs to route messages to your specific account.</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">developers.facebook.com/apps</a> → select your App → <strong>WhatsApp → API Setup</strong>.</li>
                <li>In the &quot;Send and receive messages&quot; section, make sure your phone number is selected in the <strong>&quot;From&quot;</strong> dropdown.</li>
                <li>Below the dropdown, you&apos;ll see:<br />
                  <strong>Phone number ID</strong> — a long number like <code>100983271234</code>. Copy this.<br />
                  <strong>WhatsApp Business Account ID</strong> — another long number. Copy this too.
                </li>
              </ol>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                <strong>📋 These are the first two values you&apos;ll paste into the form on this page.</strong>
              </div>
            </div>

            {/* ── STEP 7 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">7</span>
                Generate a Permanent Access Token (System User)
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 mb-2">
                <strong>⚠️ Do NOT use the temporary token</strong> shown on the API Setup page! That token expires in <strong>24 hours</strong> and will silently stop working. Follow the steps below to create a permanent one.
              </div>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Go to <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">Business Settings → System Users</a>.</li>
                <li>Click <strong>&quot;Add&quot;</strong> to create a new System User.</li>
                <li>Name it something like <em>&quot;CRM Integration&quot;</em> or <em>&quot;WhatsApp API Bot&quot;</em>.</li>
                <li>Set the role to <strong>&quot;Admin&quot;</strong> (not &quot;Employee&quot;).</li>
                <li>Click on the System User you just created, then click <strong>&quot;Add Assets&quot;</strong>.</li>
                <li>In the &quot;Add Assets&quot; popup:
                  <ul className="list-disc ml-5 mt-1">
                    <li>Select <strong>&quot;Apps&quot;</strong> on the left.</li>
                    <li>Find your WhatsApp App in the middle column.</li>
                    <li>Toggle <strong>&quot;Full Control&quot;</strong> to ON on the right side.</li>
                    <li>Click <strong>&quot;Save Changes&quot;</strong>.</li>
                  </ul>
                </li>
                <li>Now click <strong>&quot;Generate New Token&quot;</strong>.</li>
                <li>Select your App from the dropdown.</li>
                <li>In the permissions list, check these two boxes:
                  <ul className="list-disc ml-5 mt-1">
                    <li><code className="bg-gray-100 px-1 rounded">whatsapp_business_messaging</code> — allows sending &amp; receiving messages</li>
                    <li><code className="bg-gray-100 px-1 rounded">whatsapp_business_management</code> — allows managing templates &amp; settings</li>
                  </ul>
                </li>
                <li>Click <strong>&quot;Generate Token&quot;</strong>.</li>
                <li><strong>Copy this token immediately and save it securely.</strong> You will NOT be able to see it again after closing this dialog. If you lose it, you&apos;ll need to generate a new one.</li>
              </ol>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                <strong>📋 This is the third and final value you&apos;ll paste into the form on this page.</strong> This token does not expire.
              </div>
            </div>

            {/* ── STEP 8 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">8</span>
                Paste Your Credentials Here &amp; Save
              </h3>
              <p>Come back to this page and fill in the three fields in the form:</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li><strong>WABA ID</strong> — from Step 6</li>
                <li><strong>Phone Number ID</strong> — from Step 6</li>
                <li><strong>Permanent Access Token</strong> — from Step 7</li>
              </ol>
              <p>Click <strong>&quot;Save Credentials&quot;</strong>. Your token is encrypted using AES-256-GCM before being stored — it is never saved in plain text.</p>
            </div>

            {/* ── STEP 9 ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">9</span>
                Message Template Approval (We Handle This)
              </h3>
              <p>WhatsApp requires pre-approved <strong>message templates</strong> to send outbound messages to patients (e.g. appointment confirmations). After you save your credentials above, we will automatically submit the required templates to Meta for your account.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>⏱ Time:</strong> Template review by Meta typically takes <strong>a few minutes to 24 hours</strong>. Once approved, appointment messages will begin sending automatically. We&apos;ll update the status on this page.
              </div>
              <p>You can also view and manage your templates directly at: <a href="https://business.facebook.com/wa/manage/message-templates/" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">Meta WhatsApp Manager → Message Templates</a></p>
            </div>

            {/* ── SUMMARY ── */}
            <div className="border-2 border-emerald-200 bg-emerald-50 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-emerald-900">📋 Quick Reference — All Links</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <a href="https://business.facebook.com/overview" target="_blank" rel="noreferrer" className="text-emerald-700 underline">Meta Business Suite — Create Business Portfolio</a>
                <a href="https://business.facebook.com/settings/security" target="_blank" rel="noreferrer" className="text-emerald-700 underline">Business Settings → Security Center (Business Verification)</a>
                <a href="https://business.facebook.com/billing_hub/payment_methods" target="_blank" rel="noreferrer" className="text-emerald-700 underline">Business Settings → Billing &amp; Payments → Payment Methods</a>
                <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-emerald-700 underline">Meta Developer Dashboard — Create &amp; Manage Apps</a>
                <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noreferrer" className="text-emerald-700 underline">Business Settings → System Users (Permanent Tokens)</a>
                <a href="https://business.facebook.com/wa/manage/message-templates/" target="_blank" rel="noreferrer" className="text-emerald-700 underline">WhatsApp Manager → Message Templates</a>
                <a href="https://business.facebook.com/wa/manage/phone-numbers/" target="_blank" rel="noreferrer" className="text-emerald-700 underline">WhatsApp Manager → Phone Numbers</a>
                <a href="https://developers.facebook.com/docs/whatsapp/pricing" target="_blank" rel="noreferrer" className="text-emerald-700 underline">WhatsApp Business API Pricing</a>
                <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noreferrer" className="text-emerald-700 underline">Official Cloud API Documentation</a>
              </div>
            </div>

            {/* ── TIMELINE SUMMARY ── */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-gray-900">⏱ Total Timeline Summary</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Step</th>
                    <th className="text-left py-2 font-semibold">Wait Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="py-2">Create Business Portfolio</td><td className="py-2 text-emerald-600 font-medium">Instant</td></tr>
                  <tr><td className="py-2">Business Verification (document review)</td><td className="py-2 text-amber-600 font-medium">1–3 business days</td></tr>
                  <tr><td className="py-2">Add Payment Method</td><td className="py-2 text-emerald-600 font-medium">Instant</td></tr>
                  <tr><td className="py-2">Create App &amp; Add WhatsApp</td><td className="py-2 text-emerald-600 font-medium">Instant</td></tr>
                  <tr><td className="py-2">Phone Number Verification</td><td className="py-2 text-emerald-600 font-medium">Instant (SMS/Call)</td></tr>
                  <tr><td className="py-2">Display Name Approval</td><td className="py-2 text-amber-600 font-medium">Up to 24 hours</td></tr>
                  <tr><td className="py-2">Generate Permanent Token</td><td className="py-2 text-emerald-600 font-medium">Instant</td></tr>
                  <tr><td className="py-2">Message Template Approval</td><td className="py-2 text-amber-600 font-medium">Minutes to 24 hours</td></tr>
                  <tr className="border-t-2"><td className="py-2 font-bold">Total (worst case)</td><td className="py-2 text-amber-700 font-bold">~3–5 business days</td></tr>
                </tbody>
              </table>
            </div>

          </div>
          <DialogFooter>
            <Button className="text-white" onClick={() => setGuideOpen(false)}>Close Guide</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
