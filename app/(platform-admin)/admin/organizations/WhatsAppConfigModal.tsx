"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Key, Phone, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import axios from "axios";

interface WhatsAppConfigModalProps {
  organizationId: string;
  organizationName: string;
  plan: string;
}

export default function WhatsAppConfigModal({
  organizationId,
  organizationName,
  plan,
}: WhatsAppConfigModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const [formData, setFormData] = useState({
    wabaId: "",
    phoneNumberId: "",
    accessToken: "",
  });
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/organization/whatsapp?organizationId=${organizationId}`);
      if (res.data.success && res.data.data) {
        setConfig(res.data.data);
        setHasToken(res.data.data.hasToken);
        setFormData({
          wabaId: res.data.data.wabaId || "",
          phoneNumberId: res.data.data.phoneNumberId || "",
          accessToken: "", // don't load the token, keep it secure
        });
      } else {
        setConfig(null);
        setHasToken(false);
        setFormData({ wabaId: "", phoneNumberId: "", accessToken: "" });
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
        organizationId,
        wabaId: formData.wabaId,
        phoneNumberId: formData.phoneNumberId,
      };

      if (formData.accessToken) {
         payload.accessToken = formData.accessToken;
      }

      const res = await axios.post("/api/organization/whatsapp", payload);
      
      if (res.data.success) {
        toast.success("WhatsApp credentials saved!");
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTemplate = async () => {
    try {
      setSaving(true);
      // Example payload for appointment confirmation
      const templatePayload = {
        name: "appointment_confirmation",
        language: "en_US",
        category: "UTILITY",
        components: [
          {
            type: "BODY",
            text: "Hello {{1}} 👋,\n\nYour appointment with {{2}} has been confirmed ✅\n\n📅 Date: {{3}}\n⏰ Time: {{4}}\n\nPlease arrive a few minutes early.\nFor assistance or rescheduling, feel free to contact our clinic.\n\nThank you!"
          }
        ]
      };

      const res = await axios.post("/api/organization/whatsapp/template", {
        organizationId,
        templateName: "appointment_confirmation",
        templatePayload
      });
      
      if (res.data.success) {
        toast.success("Template submitted for approval!");
        fetchConfig();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={plan?.toLowerCase() !== "pro"}
          title={plan?.toLowerCase() !== "pro" ? "Upgrade to Pro to enable WhatsApp" : "Configure WhatsApp"}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl">WhatsApp Integration</DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure Meta Cloud API credentials for {organizationName}.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {config?.isActive && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">WhatsApp Active</h4>
                  <p className="text-xs opacity-90 mt-1">
                    Connected on {new Date(config.connectedAt).toLocaleDateString()}
                  </p>
                  {config.templateStatus && (
                    <div className="mt-2 text-xs font-medium">
                      Template Status: <span className="uppercase text-emerald-300">{config.templateStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="wabaId">WhatsApp Business Account ID (WABA ID)</Label>
              <div className="relative">
                <BuildingIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="wabaId"
                  value={formData.wabaId}
                  onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })}
                  className="pl-9 bg-slate-900 border-slate-800"
                  placeholder="e.g. 100239281723"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="phoneNumberId"
                  value={formData.phoneNumberId}
                  onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                  className="pl-9 bg-slate-900 border-slate-800"
                  placeholder="e.g. 100983271234"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <Label className="text-slate-300">Permanent Access Token</Label>
                {hasToken ? (
                  <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Token securely saved
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                    Token missing
                  </span>
                )}
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="token"
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  className="pl-9 bg-slate-900 border-slate-800"
                  placeholder={config ? "Leave blank to keep existing encrypted token" : "EAA..."}
                />
              </div>
              <p className="text-xs text-slate-500">
                {hasToken 
                  ? "Leave this blank unless you need to update the existing encrypted token." 
                  : "This token is securely encrypted before being saved to the database."}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-4">
               {config?.isActive && (
                  <Button 
                    variant="secondary" 
                    onClick={handleSubmitTemplate} 
                    disabled={saving}
                    className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Template
                  </Button>
               )}
              <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Credentials
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Inline icon component since Building is not imported
function BuildingIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
